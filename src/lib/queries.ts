import 'server-only';
import { asc, eq } from 'drizzle-orm';
import { unstable_cache as cache } from 'next/cache';
import { db, schema } from '@/db/client';
import { DEFAULT_LOCALE, type Locale } from './i18n';

/**
 * Una sola lectura agregada por página (§11). Las tablas del CV suman unos
 * pocos cientos de filas: traerlas completas y resolver en memoria sale más
 * barato que encadenar consultas filtradas, y deja el merge de traducciones
 * en un único punto.
 *
 * Orden de resolución:
 *   1. filas base (español)
 *   2. override del idioma pedido        → si falta, cae al español
 *   3. reglas de la variante             → visibilidad y prioridad
 */

type EntityType = (typeof schema.entityTypeEnum)[number];
type TrIndex = Map<string, string>;

const key = (t: EntityType, id: number, field: string) => `${t}:${id}:${field}`;

/** Aplica los overrides del idioma sobre una fila base. */
function localize<R extends { id: number }>(
  row: R,
  type: EntityType,
  fields: readonly (keyof R & string)[],
  tr: TrIndex,
): R {
  if (tr.size === 0) return row;
  const out = { ...row };
  for (const f of fields) {
    const v = tr.get(key(type, row.id, f));
    if (v !== undefined) out[f] = v as R[typeof f];
  }
  return out;
}

/** Regla de la variante: sin regla → visible, prioridad natural. */
type Rule = { visible: boolean; priority: number | null };

function applyRules<R extends { id: number; order: number }>(
  rows: R[],
  type: EntityType,
  rules: Map<string, Rule>,
): R[] {
  return rows
    .map((r) => ({ row: r, rule: rules.get(`${type}:${r.id}`) }))
    .filter(({ rule }) => rule?.visible !== false)
    .sort((a, b) => (a.rule?.priority ?? a.row.order) - (b.rule?.priority ?? b.row.order))
    .map(({ row }) => row);
}

async function loadCv(locale: Locale, variantSlug: string) {
  const [
    profiles, variants, links, groups, skills,
    experiences, achievements, techs, projects,
    education, certifications, languages, translations, settings,
  ] = await Promise.all([
    db.select().from(schema.profile).limit(1),
    db.select().from(schema.variant).orderBy(asc(schema.variant.order)),
    db.select().from(schema.link).orderBy(asc(schema.link.order)),
    db.select().from(schema.skillGroup).orderBy(asc(schema.skillGroup.order)),
    db.select().from(schema.skill).orderBy(asc(schema.skill.order)),
    db.select().from(schema.experience).orderBy(asc(schema.experience.order)),
    db.select().from(schema.achievement).orderBy(asc(schema.achievement.order)),
    db.select().from(schema.expTech).orderBy(asc(schema.expTech.order)),
    db.select().from(schema.project).orderBy(asc(schema.project.order)),
    db.select().from(schema.education).orderBy(asc(schema.education.order)),
    db.select().from(schema.certification).orderBy(asc(schema.certification.order)),
    db.select().from(schema.language).orderBy(asc(schema.language.order)),
    locale === DEFAULT_LOCALE
      ? Promise.resolve([])
      : db.select().from(schema.translation).where(eq(schema.translation.locale, locale)),
    db.select().from(schema.setting),
  ]);

  const profile = profiles[0];
  if (!profile) throw new Error('Sin perfil en base de datos. ¿Se ejecutó el seed?');

  const active =
    variants.find((v) => v.slug === variantSlug) ??
    variants.find((v) => v.isDefault) ??
    variants[0];
  if (!active) throw new Error('Sin variantes en base de datos. ¿Se ejecutó el seed?');

  // Índice de traducciones. Ausencia de clave = respaldo al español.
  const tr: TrIndex = new Map(
    translations.map((t) => [key(t.entityType, t.entityId, t.field), t.value]),
  );

  const ruleRows = await db
    .select()
    .from(schema.variantRule)
    .where(eq(schema.variantRule.variantId, active.id));
  const rules = new Map<string, Rule>(
    ruleRows.map((r) => [`${r.entityType}:${r.entityId}`, { visible: r.visible, priority: r.priority }]),
  );

  const localizedVariant = localize(active, 'variant', ['label', 'headline', 'summary'], tr);

  const visibleExperiences = applyRules(
    experiences.map((e) => localize(e, 'experience', ['role', 'context'], tr)),
    'experience',
    rules,
  ).map((e) => ({
    ...e,
    achievements: applyRules(
      achievements
        .filter((a) => a.experienceId === e.id)
        .map((a) => localize(a, 'achievement', ['text', 'metricLabel'], tr)),
      'achievement',
      rules,
    ),
    tech: techs.filter((t) => t.experienceId === e.id).map((t) => t.tech),
  }));

  return {
    locale,
    profile: {
      ...localize(profile, 'profile', ['headline', 'summary', 'summaryShort', 'location', 'availability'], tr),
      // El titular y el resumen SIEMPRE los manda la variante activa.
      headline: localizedVariant.headline,
      summary: localizedVariant.summary,
      subtitle: tr.get(key('profile', profile.id, 'subtitle')) ?? null,
    },
    variant: localizedVariant,
    variants: variants.map((v) => localize(v, 'variant', ['label'], tr)),
    links,
    skillGroups: applyRules(
      groups.map((g) => localize(g, 'skill_group', ['name'], tr)),
      'skill_group',
      rules,
    ).map((g) => ({
      ...g,
      skills: applyRules(skills.filter((s) => s.groupId === g.id), 'skill', rules),
    })),
    experiences: visibleExperiences,
    projects: applyRules(
      projects
        .filter((p) => !p.isDraft)
        .map((p) => localize(p, 'project', ['title', 'problem', 'decision', 'architecture', 'result', 'learning'], tr)),
      'project',
      rules,
    ),
    education: education.map((e) => localize(e, 'education', ['title', 'level'], tr)),
    certifications: certifications.map((c) => localize(c, 'certification', ['name'], tr)),
    languages,
    settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) as Record<string, unknown>,
  };
}

export type Cv = Awaited<ReturnType<typeof loadCv>>;

/**
 * Cacheado por etiqueta: publicar desde /admin invalida `cv` y el sitio y los
 * PDF reflejan el cambio sin volver a desplegar (criterio de aceptación §13).
 */
export function getCv(locale: Locale, variantSlug: string) {
  return cache(() => loadCv(locale, variantSlug), ['cv', locale, variantSlug], {
    tags: ['cv'],
    revalidate: 3600,
  })();
}

/** Slugs de variantes, para generateStaticParams y el conmutador. */
export async function getVariantSlugs(): Promise<string[]> {
  const rows = await db.select({ slug: schema.variant.slug }).from(schema.variant);
  return rows.map((r) => r.slug);
}
