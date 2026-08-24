import { desc, gte, sql } from 'drizzle-orm';
import { db, schema } from '@/db/client';

export const dynamic = 'force-dynamic';

/**
 * Panel de transparencia (§5). Muestra exactamente lo que se guarda, que es
 * poco a propósito: sin cookies, sin IP, sin país. Si el panel puede enseñar
 * la tabla entera sin incomodar a nadie, la promesa de privacidad es real.
 */
export default async function AnaliticaPage() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [byType, byVariant, byLocale, topPaths, referrers, recent] = await Promise.all([
    db
      .select({ type: schema.event.type, n: sql<number>`count(*)` })
      .from(schema.event)
      .where(gte(schema.event.createdAt, since))
      .groupBy(schema.event.type),
    db
      .select({ variant: schema.event.variantSlug, n: sql<number>`count(*)` })
      .from(schema.event)
      .where(gte(schema.event.createdAt, since))
      .groupBy(schema.event.variantSlug),
    db
      .select({ locale: schema.event.locale, n: sql<number>`count(*)` })
      .from(schema.event)
      .where(gte(schema.event.createdAt, since))
      .groupBy(schema.event.locale),
    db
      .select({ path: schema.event.path, n: sql<number>`count(*)` })
      .from(schema.event)
      .where(gte(schema.event.createdAt, since))
      .groupBy(schema.event.path)
      .orderBy(desc(sql`count(*)`))
      .limit(8),
    db
      .select({ referrer: schema.event.referrer, n: sql<number>`count(*)` })
      .from(schema.event)
      .where(gte(schema.event.createdAt, since))
      .groupBy(schema.event.referrer)
      .orderBy(desc(sql`count(*)`))
      .limit(8),
    db.select().from(schema.event).orderBy(desc(schema.event.createdAt)).limit(10),
  ]);

  const total = byType.reduce((a, b) => a + Number(b.n), 0);

  const Card = ({ title, rows }: { title: string; rows: { label: string; n: number }[] }) => (
    <article className="rounded border border-[var(--line)] bg-[var(--surface)] p-5">
      <h2 className="mb-3 font-mono text-[0.7rem] uppercase tracking-wide text-[var(--muted)]">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-[var(--step--1)] text-[var(--muted)]">Sin datos todavía.</p>
      ) : (
        <dl className="space-y-2">
          {rows.map((r) => (
            <div key={r.label} className="flex items-baseline justify-between gap-4">
              <dt className="truncate text-[var(--step--1)]">{r.label}</dt>
              <dd className="tabular font-mono text-[var(--phosphor)]">{r.n}</dd>
            </div>
          ))}
        </dl>
      )}
    </article>
  );

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[var(--step-3)] leading-tight">Analítica</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Últimos 30 días · {total} eventos. Se guarda el tipo, la ruta, la variante, el idioma y el referrer.
          Nada más: sin cookies, sin direcciones IP, sin país.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card title="Por tipo de evento" rows={byType.map((r) => ({ label: r.type, n: Number(r.n) }))} />
        <Card title="Por variante" rows={byVariant.map((r) => ({ label: r.variant ?? '—', n: Number(r.n) }))} />
        <Card title="Por idioma" rows={byLocale.map((r) => ({ label: r.locale, n: Number(r.n) }))} />
        <Card title="Rutas más vistas" rows={topPaths.map((r) => ({ label: r.path, n: Number(r.n) }))} />
        <Card
          title="De dónde llegan"
          rows={referrers.map((r) => ({ label: r.referrer ?? 'directo', n: Number(r.n) }))}
        />
      </div>

      <section className="mt-10">
        <h2 className="text-[var(--step-1)]">Últimos eventos, sin filtrar</h2>
        <p className="mt-1 text-[var(--step--1)] text-[var(--muted)]">
          Esto es literalmente cada columna de la tabla. No hay nada oculto detrás.
        </p>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left font-mono text-[var(--step--1)]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[0.7rem] uppercase text-[var(--muted)]">
                <th scope="col" className="py-2 pr-4 font-normal">Cuándo</th>
                <th scope="col" className="py-2 pr-4 font-normal">Tipo</th>
                <th scope="col" className="py-2 pr-4 font-normal">Ruta</th>
                <th scope="col" className="py-2 pr-4 font-normal">Variante</th>
                <th scope="col" className="py-2 pr-4 font-normal">Idioma</th>
                <th scope="col" className="py-2 font-normal">Referrer</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((e) => (
                <tr key={e.id} className="border-b border-[var(--line)] text-[var(--muted)]">
                  <td className="tabular whitespace-nowrap py-2 pr-4">
                    <time dateTime={e.createdAt.toISOString()}>
                      {e.createdAt.toISOString().slice(0, 16).replace('T', ' ')}
                    </time>
                  </td>
                  <td className="py-2 pr-4 text-[var(--text)]">{e.type}</td>
                  <td className="py-2 pr-4">{e.path}</td>
                  <td className="py-2 pr-4">{e.variantSlug ?? '—'}</td>
                  <td className="py-2 pr-4">{e.locale}</td>
                  <td className="max-w-40 truncate py-2">{e.referrer ?? 'directo'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recent.length === 0 ? (
            <p className="py-4 text-[var(--step--1)] text-[var(--muted)]">
              Todavía no hay eventos. Aparecerán cuando el sitio reciba su primera visita.
            </p>
          ) : null}
        </div>
      </section>
    </>
  );
}
