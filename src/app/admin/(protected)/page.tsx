import Link from 'next/link';
import { desc, eq, sql } from 'drizzle-orm';
import { db, schema } from '@/db/client';
import { getTranslationStatus } from '@/lib/actions';
import { PublishButton } from './publish-button';

export const dynamic = 'force-dynamic';

export default async function AdminHome() {
  const [status, drafts, recent] = await Promise.all([
    getTranslationStatus(),
    db.select().from(schema.project).where(eq(schema.project.isDraft, true)),
    db.select().from(schema.auditLog).orderBy(desc(schema.auditLog.createdAt)).limit(8),
  ]);

  const [{ views }] = (await db
    .select({ views: sql<number>`count(*)` })
    .from(schema.event)
    .where(eq(schema.event.type, 'view'))) as [{ views: number }];

  return (
    <>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[var(--step-3)] leading-tight">Resumen</h1>
          <p className="mt-2 text-[var(--muted)]">Publicar refresca el sitio y los diez PDF sin volver a desplegar.</p>
        </div>
        <PublishButton />
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <article className="rounded border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-wide text-[var(--muted)]">Traducción al inglés</h2>
          <p className="tabular mt-2 text-[var(--step-3)] leading-none text-[var(--phosphor)]">
            {status.translated}
            <span className="text-[var(--step-1)] text-[var(--muted)]">/{status.total}</span>
          </p>
          <p className="mt-2 text-[var(--step--1)] text-[var(--muted)]">
            {status.missing === 0
              ? 'Todo traducido.'
              : `${status.missing} campo(s) mostrarán el español hasta que se traduzcan.`}
          </p>
        </article>

        <article className="rounded border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-wide text-[var(--muted)]">Casos en borrador</h2>
          <p className="tabular mt-2 text-[var(--step-3)] leading-none text-[var(--phosphor)]">{drafts.length}</p>
          <p className="mt-2 text-[var(--step--1)] text-[var(--muted)]">
            {drafts.length === 0
              ? 'Todos los casos están publicados.'
              : 'No aparecen en el sitio hasta que apruebes el redactado.'}
          </p>
        </article>

        <article className="rounded border border-[var(--line)] bg-[var(--surface)] p-5">
          <h2 className="font-mono text-[0.7rem] uppercase tracking-wide text-[var(--muted)]">Páginas vistas</h2>
          <p className="tabular mt-2 text-[var(--step-3)] leading-none text-[var(--signal)]">{Number(views)}</p>
          <p className="mt-2 text-[var(--step--1)] text-[var(--muted)]">Sin cookies, sin IP, sin país.</p>
        </article>
      </div>

      {drafts.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-[var(--step-1)]">Pendientes de revisión</h2>
          <p className="mt-1 text-[var(--step--1)] text-[var(--muted)]">
            Redactados a partir de tus datos. Léelos antes de aprobarlos: tendrás que sostenerlos en entrevista.
          </p>
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {drafts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-4 py-3">
                <span className="text-[var(--step--1)]">{p.title}</span>
                <Link href={`/admin/proyectos?p=${p.slug}`} className="text-[var(--step--1)] text-[var(--signal)]">
                  Revisar
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-10">
        <h2 className="text-[var(--step-1)]">Últimos cambios</h2>
        {recent.length === 0 ? (
          <p className="mt-2 text-[var(--step--1)] text-[var(--muted)]">
            Todavía no hay cambios registrados. Empieza por <Link href="/admin/variantes" className="text-[var(--signal)]">Variantes</Link>.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-[var(--line)] font-mono text-[var(--step--1)]">
            {recent.map((a) => (
              <li key={a.id} className="flex justify-between gap-4 py-2 text-[var(--muted)]">
                <span>{a.action} · {a.entity}</span>
                <time className="tabular" dateTime={a.createdAt.toISOString()}>
                  {a.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                </time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
