import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/db/client';
import { ExperienceEditor } from './experience-editor';

export const dynamic = 'force-dynamic';

export default async function ExperienciaPage({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;

  const [experiences, achievements, translations] = await Promise.all([
    db.select().from(schema.experience).orderBy(asc(schema.experience.order)),
    db.select().from(schema.achievement).orderBy(asc(schema.achievement.order)),
    db.select().from(schema.translation).where(eq(schema.translation.locale, 'en')),
  ]);

  const active = experiences.find((x) => String(x.id) === e) ?? experiences[0];
  if (!active) return <p className="text-[var(--muted)]">No hay experiencia. Ejecuta el seed.</p>;

  const en = new Map(translations.map((t) => [`${t.entityType}:${t.entityId}:${t.field}`, t.value]));
  const own = achievements.filter((a) => a.experienceId === active.id);

  const fields = [
    {
      entityType: 'experience', entityId: active.id, field: 'role', label: 'Cargo',
      es: active.role, en: en.get(`experience:${active.id}:role`) ?? '', maxLength: 120,
    },
    {
      entityType: 'experience', entityId: active.id, field: 'context', label: 'Contexto',
      es: active.context, en: en.get(`experience:${active.id}:context`) ?? '', multiline: true,
    },
    ...own.flatMap((a, i) => [
      {
        entityType: 'achievement', entityId: a.id, field: 'text', label: `Logro ${i + 1}`,
        es: a.text, en: en.get(`achievement:${a.id}:text`) ?? '', multiline: true,
      },
      ...(a.metricLabel
        ? [{
            entityType: 'achievement', entityId: a.id, field: 'metricLabel', label: `↳ métrica ${i + 1}`,
            es: a.metricLabel, en: en.get(`achievement:${a.id}:metricLabel`) ?? '', maxLength: 80,
          }]
        : []),
    ]),
  ];

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[var(--step-3)] leading-tight">Experiencia</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Las viñetas son logros, no funciones. Una métrica necesita etiqueta y valor, o ninguno de los dos.
        </p>

        <nav aria-label="Puesto activo" className="mt-6 flex flex-wrap gap-2">
          {experiences.map((x) => {
            const on = x.id === active.id;
            return (
              <a
                key={x.id}
                href={`/admin/experiencia?e=${x.id}`}
                aria-current={on ? 'page' : undefined}
                className={`rounded border px-3 py-2 text-[var(--step--1)] transition-colors ${
                  on ? 'border-[var(--phosphor)] text-[var(--phosphor)]' : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {x.company}
                <span className="tabular ml-2 font-mono text-[0.7rem] text-[var(--muted)]">
                  {x.startDate}→{x.endDate ?? '…'}
                </span>
              </a>
            );
          })}
        </nav>
      </header>

      <ExperienceEditor experience={active} achievements={own} fields={fields} />
    </>
  );
}
