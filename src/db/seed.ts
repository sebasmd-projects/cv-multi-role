import bcrypt from 'bcryptjs';
import { db, schema } from './client';
import {
  certifications,
  contact,
  education,
  experiences,
  knowsAbout,
  languages,
  profileContent,
  projects,
  skillGroups,
  variants,
  type T,
} from '../content/cv';

/**
 * Siembra el contenido real de §2 del brief.
 *
 * Modelo: la fila base guarda el ESPAÑOL. El inglés se inserta en
 * `translation` como override. La cadena de respaldo en → es garantiza que
 * una traducción faltante nunca produzca un hueco en la página.
 *
 * Idempotente: trunca y vuelve a sembrar. No ejecutar contra una base con
 * ediciones hechas desde /admin sin exportar antes (Admin → Exportar JSON).
 */

const EN = 'en';
type EntityType = (typeof schema.entityTypeEnum)[number];

const pending: Array<{
  entityType: EntityType;
  entityId: number;
  field: string;
  locale: string;
  value: string;
}> = [];

/** Encola la traducción inglesa de un campo emparejado. */
function tr(entityType: EntityType, entityId: number, field: string, pair: T) {
  if (pair.en && pair.en !== pair.es) {
    pending.push({ entityType, entityId, field, locale: EN, value: pair.en });
  }
}

async function insert<TTable extends { $inferInsert: object }>(
  table: TTable,
  values: TTable['$inferInsert'],
): Promise<number> {
  const [res] = await db.insert(table as never).values(values as never);
  return (res as { insertId: number }).insertId;
}

async function main() {
  console.log('→ Limpiando tablas…');
  await db.execute('SET FOREIGN_KEY_CHECKS = 0');
  for (const t of [
    'translation', 'variant_rule', 'achievement', 'exp_tech', 'experience',
    'skill', 'skill_group', 'project', 'education', 'certification',
    'language', 'link', 'variant', 'profile', 'setting', 'audit_log', 'user',
  ]) {
    await db.execute(`TRUNCATE TABLE \`${t}\``);
  }
  await db.execute('SET FOREIGN_KEY_CHECKS = 1');

  /* ── Perfil ────────────────────────────────────────────────── */
  console.log('→ Perfil');
  const profileId = await insert(schema.profile, {
    fullName: contact.fullName,
    headline: profileContent.headline.es,
    summary: profileContent.summary.es,
    summaryShort: profileContent.summaryShort.es,
    email: contact.email,
    phone: contact.phone,
    location: contact.location.es,
    availability: contact.availability.es,
  });
  tr('profile', profileId, 'headline', profileContent.headline);
  tr('profile', profileId, 'summary', profileContent.summary);
  tr('profile', profileId, 'summaryShort', profileContent.summaryShort);
  tr('profile', profileId, 'location', contact.location);
  tr('profile', profileId, 'availability', contact.availability);
  tr('profile', profileId, 'subtitle', profileContent.subtitle);

  /* ── Enlaces ───────────────────────────────────────────────── */
  for (const [i, l] of contact.links.entries()) {
    await insert(schema.link, { label: l.label, url: l.url, kind: l.kind, order: i });
  }

  /* ── Variantes ─────────────────────────────────────────────── */
  console.log('→ Variantes');
  for (const [i, v] of variants.entries()) {
    const vid = await insert(schema.variant, {
      slug: v.slug,
      label: v.label.es,
      headline: v.headline.es,
      summary: v.summary.es,
      pdfFileNameEs: v.pdf.es,
      pdfFileNameEn: v.pdf.en,
      isDefault: v.isDefault,
      order: i,
    });
    tr('variant', vid, 'label', v.label);
    tr('variant', vid, 'headline', v.headline);
    tr('variant', vid, 'summary', v.summary);
  }

  /* ── Experiencia ───────────────────────────────────────────── */
  console.log('→ Experiencia');
  for (const [i, e] of experiences.entries()) {
    const eid = await insert(schema.experience, {
      role: e.role.es,
      company: e.company,
      client: e.client ?? null,
      mode: e.mode,
      context: e.context.es,
      startDate: e.startDate,
      endDate: e.endDate,
      order: i,
    });
    tr('experience', eid, 'role', e.role);
    tr('experience', eid, 'context', e.context);

    for (const [j, a] of e.achievements.entries()) {
      const aid = await insert(schema.achievement, {
        experienceId: eid,
        text: a.text.es,
        metricLabel: a.metric?.label.es ?? null,
        metricValue: a.metric?.value ?? null,
        isApproximate: a.metric?.approx ?? false,
        order: j,
      });
      tr('achievement', aid, 'text', a.text);
      if (a.metric) tr('achievement', aid, 'metricLabel', a.metric.label);
    }

    for (const [j, t] of e.tech.entries()) {
      // Los términos técnicos no se traducen.
      await insert(schema.expTech, { experienceId: eid, tech: t, order: j });
    }
  }

  /* ── Habilidades ───────────────────────────────────────────── */
  console.log('→ Habilidades');
  for (const [i, g] of skillGroups.entries()) {
    const gid = await insert(schema.skillGroup, { name: g.name.es, order: i });
    tr('skill_group', gid, 'name', g.name);
    for (const [j, [name, tier]] of g.skills.entries()) {
      await insert(schema.skill, { groupId: gid, name, tier, order: j });
    }
  }

  /* ── Proyectos ─────────────────────────────────────────────── */
  console.log('→ Proyectos (isDraft = true hasta revisión)');
  for (const [i, p] of projects.entries()) {
    const pid = await insert(schema.project, {
      slug: p.slug,
      title: p.title.es,
      problem: p.problem.es,
      decision: p.decision.es,
      architecture: p.architecture.es,
      result: p.result.es,
      learning: p.learning.es,
      repoUrl: 'repoUrl' in p ? p.repoUrl : null,
      liveUrl: 'liveUrl' in p ? p.liveUrl : null,
      isConfidential: p.isConfidential,
      featured: p.featured,
      isDraft: true,
      order: i,
    });
    for (const f of ['title', 'problem', 'decision', 'architecture', 'result', 'learning'] as const) {
      tr('project', pid, f, p[f]);
    }
  }

  /* ── Formación, certificaciones, idiomas ───────────────────── */
  console.log('→ Formación');
  for (const [i, ed] of education.entries()) {
    const id = await insert(schema.education, {
      institution: ed.institution,
      title: ed.title.es,
      level: ed.level.es,
      status: ed.status,
      startDate: ed.startDate,
      endDate: ed.endDate,
      order: i,
    });
    tr('education', id, 'title', ed.title);
    tr('education', id, 'level', ed.level);
  }

  for (const [i, c] of certifications.entries()) {
    const id = await insert(schema.certification, {
      institution: c.institution,
      name: c.name.es,
      status: c.status,
      startDate: c.startDate,
      endDate: c.endDate,
      order: i,
    });
    tr('certification', id, 'name', c.name);
  }

  for (const [i, l] of languages.entries()) {
    await insert(schema.language, {
      name: l.name.es,
      level: l.level,
      reading: l.reading,
      writing: l.writing,
      speaking: l.speaking,
      order: i,
    });
  }

  /* ── Traducciones ──────────────────────────────────────────── */
  console.log(`→ Traducciones EN: ${pending.length} campos`);
  for (let i = 0; i < pending.length; i += 50) {
    await db.insert(schema.translation).values(pending.slice(i, i + 50));
  }

  /* ── Ajustes ───────────────────────────────────────────────── */
  console.log('→ Ajustes');
  await db.insert(schema.setting).values([
    // Crawlers de IA permitidos por defecto: un CV quiere ser citado.
    {
      key: 'ai_crawlers',
      value: {
        GPTBot: 'allow', ClaudeBot: 'allow', PerplexityBot: 'allow',
        'Google-Extended': 'allow', CCBot: 'allow', Bytespider: 'allow',
      },
    },
    { key: 'knows_about', value: knowsAbout },
    { key: 'locales', value: { default: 'es', enabled: ['es', 'en'] } },
    // El aviso de §3 queda resuelto: todas las cifras están confirmadas.
    { key: 'metrics_confirmed', value: { confirmed: true, confirmedAt: '2026-08-20' } },
    // Bloquea "Publicar" mientras haya proyectos en borrador.
    { key: 'publish_blockers', value: { projectDrafts: true } },
  ]);

  /* ── Admin ─────────────────────────────────────────────────── */
  const hash =
    process.env.ADMIN_PASSWORD_HASH ||
    (await bcrypt.hash(process.env.ADMIN_PASSWORD ?? 'cambiar-en-primer-login', 12));
  await insert(schema.user, {
    email: process.env.ADMIN_EMAIL ?? contact.email,
    passwordHash: hash,
  });

  console.log('\n✔ Seed completo.');
  console.log('  Pendiente: revisar los 5 casos de estudio y quitar isDraft.');
  process.exit(0);
}

main().catch((err) => {
  console.error('✖ Seed falló:', err);
  process.exit(1);
});
