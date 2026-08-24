import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/db/client';
import { ProjectEditor } from './project-editor';

export const dynamic = 'force-dynamic';

export default async function ProyectosPage({
  searchParams,
}: {
  searchParams: Promise<{ p?: string }>;
}) {
  const { p } = await searchParams;

  const [projects, translations] = await Promise.all([
    db.select().from(schema.project).orderBy(asc(schema.project.order)),
    db.select().from(schema.translation).where(eq(schema.translation.locale, 'en')),
  ]);

  const active = projects.find((x) => x.slug === p) ?? projects[0];
  if (!active) return <p className="text-[var(--muted)]">No hay proyectos. Ejecuta el seed.</p>;

  const en = new Map(translations.map((t) => [`${t.entityType}:${t.entityId}:${t.field}`, t.value]));

  const fields = (
    [
      ['title', 'Título', false],
      ['problem', 'Problema', true],
      ['decision', 'Decisión', true],
      ['architecture', 'Arquitectura', true],
      ['result', 'Resultado', true],
      ['learning', 'Aprendizaje', true],
    ] as const
  ).map(([field, label, multiline]) => ({
    entityType: 'project',
    entityId: active.id,
    field,
    label,
    es: active[field],
    en: en.get(`project:${active.id}:${field}`) ?? '',
    multiline,
  }));

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[var(--step-3)] leading-tight">Proyectos</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Estructura fija: problema → decisión → arquitectura → resultado → aprendizaje. Un caso en borrador no
          aparece en el sitio ni en el PDF.
        </p>

        <nav aria-label="Proyecto activo" className="mt-6 flex flex-wrap gap-2">
          {projects.map((x) => {
            const on = x.id === active.id;
            return (
              <a
                key={x.slug}
                href={`/admin/proyectos?p=${x.slug}`}
                aria-current={on ? 'page' : undefined}
                className={`rounded border px-3 py-2 text-[var(--step--1)] transition-colors ${
                  on ? 'border-[var(--phosphor)] text-[var(--phosphor)]' : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {x.title}
                {x.isDraft ? <span className="ml-2 font-mono text-[0.7rem] text-[var(--pulse)]">borrador</span> : null}
              </a>
            );
          })}
        </nav>
      </header>

      <ProjectEditor project={active} fields={fields} />
    </>
  );
}
