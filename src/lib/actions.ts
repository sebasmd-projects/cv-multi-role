'use server';

import { and, eq, sql } from 'drizzle-orm';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { db, schema } from '@/db/client';
import { auth } from '@/auth';

/**
 * Toda escritura pasa por aquí: sesión verificada, entrada validada con zod,
 * registro en `audit_log`, invalidación de la caché `cv`.
 *
 * Nunca se interpola una cadena del usuario en SQL. Drizzle parametriza; los
 * pocos `sql\`\`` de este archivo usan marcadores.
 */

const ENTITY_TYPES = [
  'profile', 'variant', 'experience', 'achievement',
  'skill_group', 'skill', 'project', 'education', 'certification',
] as const;

/** Campos traducibles por entidad. Lista blanca: sin esto, `field` sería
 *  una llave arbitraria para escribir cualquier cosa en `translation`. */
const TRANSLATABLE = {
  profile: ['headline', 'summary', 'summaryShort', 'location', 'availability', 'subtitle'],
  variant: ['label', 'headline', 'summary'],
  experience: ['role', 'context'],
  achievement: ['text', 'metricLabel'],
  skill_group: ['name'],
  skill: [],
  project: ['title', 'problem', 'decision', 'architecture', 'result', 'learning'],
  education: ['title', 'level'],
  certification: ['name'],
} as const satisfies Record<(typeof ENTITY_TYPES)[number], readonly string[]>;

export type ActionResult = { ok: true; message: string } | { ok: false; message: string };

async function requireUser(): Promise<number> {
  const session = await auth();
  const id = Number(session?.user?.id);
  if (!id) throw new Error('Sesión no válida. Vuelve a iniciar sesión.');
  return id;
}

async function log(
  userId: number,
  action: 'create' | 'update' | 'delete' | 'publish',
  entity: string,
  entityId?: number,
) {
  await db.insert(schema.auditLog).values({ userId, action, entity, entityId: entityId ?? null });
}

/* ── Traducciones ─────────────────────────────────────────────── */

const translationInput = z.object({
  entityType: z.enum(ENTITY_TYPES),
  entityId: z.coerce.number().int().positive(),
  field: z.string().min(1).max(48),
  value: z.string().max(8000),
});

/**
 * Guarda el inglés de un campo. Cadena vacía = borrar el override, con lo que
 * ese campo vuelve a mostrar el español (respaldo en → es).
 */
export async function saveTranslation(raw: unknown): Promise<ActionResult> {
  const parsed = translationInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: 'Los datos enviados no son válidos. Revisa el campo y reinténtalo.' };
  }
  const { entityType, entityId, field, value } = parsed.data;

  const allowed = TRANSLATABLE[entityType] as readonly string[];
  if (!allowed.includes(field)) {
    return { ok: false, message: `«${field}» no es un campo traducible de ${entityType}.` };
  }

  const userId = await requireUser();
  const trimmed = value.trim();

  if (trimmed === '') {
    await db.delete(schema.translation).where(
      and(
        eq(schema.translation.entityType, entityType),
        eq(schema.translation.entityId, entityId),
        eq(schema.translation.field, field),
        eq(schema.translation.locale, 'en'),
      ),
    );
  } else {
    await db
      .insert(schema.translation)
      .values({ entityType, entityId, field, locale: 'en', value: trimmed })
      .onDuplicateKeyUpdate({ set: { value: trimmed } });
  }

  await log(userId, 'update', `translation:${entityType}.${field}`, entityId);
  revalidateTag('cv', 'max');
  return {
    ok: true,
    message: trimmed === '' ? 'Traducción borrada. Este campo vuelve a mostrar el español.' : 'Traducción guardada.',
  };
}

/* ── Contenido base (español) ─────────────────────────────────── */

const variantInput = z.object({
  id: z.coerce.number().int().positive(),
  label: z.string().min(1).max(60),
  headline: z.string().min(1).max(180),
  summary: z.string().min(1).max(4000),
  pdfFileNameEs: z.string().min(1).max(120).regex(/\.pdf$/, 'Debe terminar en .pdf'),
  pdfFileNameEn: z.string().min(1).max(120).regex(/\.pdf$/, 'Debe terminar en .pdf'),
});

export async function saveVariant(raw: unknown): Promise<ActionResult> {
  const parsed = variantInput.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? 'Datos no válidos.' };
  }
  const userId = await requireUser();
  const { id, ...values } = parsed.data;

  await db.update(schema.variant).set(values).where(eq(schema.variant.id, id));
  await log(userId, 'update', 'variant', id);
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Variante guardada.' };
}

/* ── Reglas de variante ───────────────────────────────────────── */

const ruleInput = z.object({
  variantId: z.coerce.number().int().positive(),
  entityType: z.enum(ENTITY_TYPES),
  entityId: z.coerce.number().int().positive(),
  visible: z.coerce.boolean(),
  priority: z.coerce.number().int().min(0).max(999).nullable().optional(),
});

export async function saveVariantRule(raw: unknown): Promise<ActionResult> {
  const parsed = ruleInput.safeParse(raw);
  if (!parsed.success) return { ok: false, message: 'Regla no válida.' };
  const userId = await requireUser();
  const { variantId, entityType, entityId, visible, priority } = parsed.data;

  await db
    .insert(schema.variantRule)
    .values({ variantId, entityType, entityId, visible, priority: priority ?? null })
    .onDuplicateKeyUpdate({ set: { visible, priority: priority ?? null } });

  await log(userId, 'update', `variant_rule:${entityType}`, entityId);
  revalidateTag('cv', 'max');
  return { ok: true, message: visible ? 'Bloque visible en esta variante.' : 'Bloque oculto en esta variante.' };
}

/** Devuelve el bloque al comportamiento por defecto: visible, orden natural. */
export async function resetVariantRule(raw: unknown): Promise<ActionResult> {
  const parsed = ruleInput.pick({ variantId: true, entityType: true, entityId: true }).safeParse(raw);
  if (!parsed.success) return { ok: false, message: 'Regla no válida.' };
  const userId = await requireUser();
  const { variantId, entityType, entityId } = parsed.data;

  await db.delete(schema.variantRule).where(
    and(
      eq(schema.variantRule.variantId, variantId),
      eq(schema.variantRule.entityType, entityType),
      eq(schema.variantRule.entityId, entityId),
    ),
  );
  await log(userId, 'delete', `variant_rule:${entityType}`, entityId);
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Regla eliminada. El bloque vuelve al orden por defecto.' };
}

/* ── Proyectos ────────────────────────────────────────────────── */

/** Quita el borrador de un caso de estudio. Es el paso que Sebastian
 *  debe hacer a mano tras revisar el redactado. */
export async function approveProject(raw: unknown): Promise<ActionResult> {
  const parsed = z.object({ id: z.coerce.number().int().positive() }).safeParse(raw);
  if (!parsed.success) return { ok: false, message: 'Proyecto no válido.' };
  const userId = await requireUser();

  await db.update(schema.project).set({ isDraft: false }).where(eq(schema.project.id, parsed.data.id));
  await log(userId, 'publish', 'project', parsed.data.id);
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Caso de estudio aprobado. Ya aparece en el sitio.' };
}

/* ── Publicar ─────────────────────────────────────────────────── */

/**
 * Invalida la caché del sitio y marca los PDF para regeneración. No hay
 * "borrador vs. publicado" por campo: el borrador es el estado de la base,
 * publicar es hacerlo visible y refrescar los diez PDF.
 */
export async function publish(): Promise<ActionResult> {
  const userId = await requireUser();

  const [{ drafts }] = (await db
    .select({ drafts: sql<number>`count(*)` })
    .from(schema.project)
    .where(eq(schema.project.isDraft, true))) as [{ drafts: number }];

  await db.update(schema.profile).set({ updatedAt: new Date() });
  await log(userId, 'publish', 'site');
  revalidateTag('cv', 'max');
  revalidateTag('pdf', 'max');

  return {
    ok: true,
    message:
      drafts > 0
        ? `Publicado. ${drafts} caso(s) de estudio siguen en borrador y no aparecen en el sitio.`
        : 'Publicado. El sitio y los PDF están al día.',
  };
}

/* ── Estado de traducción ─────────────────────────────────────── */

export type TranslationStatus = { total: number; translated: number; missing: number };

/** Alimenta el contador «N sin traducir» del panel. */
export async function getTranslationStatus(): Promise<TranslationStatus> {
  const [counts, existing] = await Promise.all([
    Promise.all(
      ENTITY_TYPES.map(async (t) => {
        const fields = (TRANSLATABLE[t] as readonly string[]).length;
        if (fields === 0) return 0;
        const table = {
          profile: schema.profile, variant: schema.variant, experience: schema.experience,
          achievement: schema.achievement, skill_group: schema.skillGroup, skill: schema.skill,
          project: schema.project, education: schema.education, certification: schema.certification,
        }[t];
        const [{ n }] = (await db.select({ n: sql<number>`count(*)` }).from(table)) as [{ n: number }];
        return Number(n) * fields;
      }),
    ),
    db
      .select({ n: sql<number>`count(*)` })
      .from(schema.translation)
      .where(eq(schema.translation.locale, 'en')),
  ]);

  const total = counts.reduce((a, b) => a + b, 0);
  const translated = Number(existing[0]?.n ?? 0);
  return { total, translated, missing: Math.max(0, total - translated) };
}

/* ── Perfil ───────────────────────────────────────────────────── */

const profileInput = z.object({
  id: z.coerce.number().int().positive(),
  fullName: z.string().min(1).max(120),
  headline: z.string().min(1).max(180),
  summary: z.string().min(1).max(4000),
  // 155 es el límite práctico de una meta description antes de que Google la
  // recorte. Se valida aquí, no solo en la interfaz.
  summaryShort: z.string().min(1).max(155),
  email: z.string().email().max(160),
  phone: z.string().max(40).nullish(),
  location: z.string().min(1).max(120),
  availability: z.string().min(1).max(120),
});

export async function saveProfile(raw: unknown): Promise<ActionResult> {
  const parsed = profileInput.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `${issue?.path.join('.')}: ${issue?.message}` };
  }
  const userId = await requireUser();
  const { id, ...values } = parsed.data;

  await db.update(schema.profile).set({ ...values, phone: values.phone ?? null }).where(eq(schema.profile.id, id));
  await log(userId, 'update', 'profile', id);
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Perfil guardado.' };
}

/* ── Experiencia ──────────────────────────────────────────────── */

const YM = /^\d{4}-(0[1-9]|1[0-2])$/;

const experienceInput = z.object({
  id: z.coerce.number().int().positive(),
  role: z.string().min(1).max(120),
  company: z.string().min(1).max(120),
  client: z.string().max(120).nullish(),
  mode: z.enum(['remoto', 'hibrido', 'presencial', 'paralelo']),
  context: z.string().min(1).max(2000),
  startDate: z.string().regex(YM, 'Formato AAAA-MM'),
  endDate: z.string().regex(YM, 'Formato AAAA-MM').nullish(),
});

export async function saveExperience(raw: unknown): Promise<ActionResult> {
  const parsed = experienceInput.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `${issue?.path.join('.')}: ${issue?.message}` };
  }
  const userId = await requireUser();
  const { id, ...values } = parsed.data;

  if (values.endDate && values.endDate < values.startDate) {
    return { ok: false, message: 'La fecha de fin es anterior a la de inicio.' };
  }

  await db
    .update(schema.experience)
    .set({ ...values, client: values.client || null, endDate: values.endDate || null })
    .where(eq(schema.experience.id, id));

  await log(userId, 'update', 'experience', id);
  revalidateTag('cv', 'max');

  // Un solapamiento de fechas lo detecta cualquier reclutador que contraste el
  // CV con LinkedIn, así que se avisa aquí en vez de dejarlo pasar en silencio.
  const rows = await db.select().from(schema.experience);
  const overlap = rows.some(
    (a) =>
      a.id !== id &&
      a.mode !== 'paralelo' &&
      values.mode !== 'paralelo' &&
      (a.endDate ?? '9999-12') >= values.startDate &&
      (values.endDate ?? '9999-12') >= a.startDate,
  );

  return {
    ok: true,
    message: overlap
      ? 'Guardado, pero las fechas se solapan con otro puesto. Marca uno como «paralelo» o ajusta el periodo.'
      : 'Experiencia guardada.',
  };
}

const achievementInput = z.object({
  id: z.coerce.number().int().positive(),
  text: z.string().min(1).max(1000),
  metricLabel: z.string().max(80).nullish(),
  metricValue: z.string().max(60).nullish(),
  isApproximate: z.coerce.boolean(),
});

export async function saveAchievement(raw: unknown): Promise<ActionResult> {
  const parsed = achievementInput.safeParse(raw);
  if (!parsed.success) return { ok: false, message: 'Logro no válido.' };
  const userId = await requireUser();
  const { id, ...values } = parsed.data;

  // Una cifra sin etiqueta no se puede leer; una etiqueta sin cifra no dice nada.
  const hasLabel = !!values.metricLabel?.trim();
  const hasValue = !!values.metricValue?.trim();
  if (hasLabel !== hasValue) {
    return { ok: false, message: 'La métrica necesita etiqueta y valor, o ninguno de los dos.' };
  }

  await db
    .update(schema.achievement)
    .set({
      text: values.text,
      metricLabel: values.metricLabel?.trim() || null,
      metricValue: values.metricValue?.trim() || null,
      isApproximate: values.isApproximate,
    })
    .where(eq(schema.achievement.id, id));

  await log(userId, 'update', 'achievement', id);
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Logro guardado.' };
}

/* ── Proyectos ────────────────────────────────────────────────── */

const projectInput = z.object({
  id: z.coerce.number().int().positive(),
  title: z.string().min(1).max(160),
  problem: z.string().min(1).max(4000),
  decision: z.string().min(1).max(4000),
  architecture: z.string().min(1).max(4000),
  result: z.string().min(1).max(4000),
  learning: z.string().min(1).max(4000),
  repoUrl: z.string().url().max(255).nullish().or(z.literal('')),
  liveUrl: z.string().url().max(255).nullish().or(z.literal('')),
  isConfidential: z.coerce.boolean(),
  featured: z.coerce.boolean(),
});

export async function saveProject(raw: unknown): Promise<ActionResult> {
  const parsed = projectInput.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, message: `${issue?.path.join('.')}: ${issue?.message}` };
  }
  const userId = await requireUser();
  const { id, repoUrl, liveUrl, ...values } = parsed.data;

  await db
    .update(schema.project)
    .set({ ...values, repoUrl: repoUrl || null, liveUrl: liveUrl || null })
    .where(eq(schema.project.id, id));

  await log(userId, 'update', 'project', id);
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Caso de estudio guardado.' };
}

/** Devuelve un caso publicado al estado de borrador. */
export async function unapproveProject(raw: unknown): Promise<ActionResult> {
  const parsed = z.object({ id: z.coerce.number().int().positive() }).safeParse(raw);
  if (!parsed.success) return { ok: false, message: 'Proyecto no válido.' };
  const userId = await requireUser();

  await db.update(schema.project).set({ isDraft: true }).where(eq(schema.project.id, parsed.data.id));
  await log(userId, 'update', 'project', parsed.data.id);
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Vuelto a borrador. Ya no aparece en el sitio.' };
}

/* ── Habilidades ──────────────────────────────────────────────── */

export async function saveSkillTier(raw: unknown): Promise<ActionResult> {
  const parsed = z
    .object({
      id: z.coerce.number().int().positive(),
      tier: z.enum(['nucleo', 'solido', 'en_uso']),
      evidenceUrl: z.string().url().max(255).nullish().or(z.literal('')),
    })
    .safeParse(raw);
  if (!parsed.success) return { ok: false, message: 'Habilidad no válida.' };
  const userId = await requireUser();

  await db
    .update(schema.skill)
    .set({ tier: parsed.data.tier, evidenceUrl: parsed.data.evidenceUrl || null })
    .where(eq(schema.skill.id, parsed.data.id));

  await log(userId, 'update', 'skill', parsed.data.id);
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Habilidad guardada.' };
}

/* ── Ajustes ──────────────────────────────────────────────────── */

const CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot', 'Bytespider'] as const;

export async function saveAiCrawlers(raw: unknown): Promise<ActionResult> {
  const parsed = z
    .record(z.enum(CRAWLERS), z.enum(['allow', 'disallow']))
    .safeParse(raw);
  if (!parsed.success) return { ok: false, message: 'Políticas no válidas.' };
  const userId = await requireUser();

  await db
    .insert(schema.setting)
    .values({ key: 'ai_crawlers', value: parsed.data })
    .onDuplicateKeyUpdate({ set: { value: parsed.data } });

  await log(userId, 'update', 'setting:ai_crawlers');
  // robots.txt se genera desde base de datos, así que basta con invalidar.
  revalidateTag('cv', 'max');
  return { ok: true, message: 'Políticas guardadas. /robots.txt ya las refleja.' };
}
