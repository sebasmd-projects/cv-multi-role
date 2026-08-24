import { asc } from 'drizzle-orm';
import { db, schema } from '@/db/client';

export const dynamic = 'force-dynamic';

/**
 * Previsualización real: se abre el mismo route handler que descarga el
 * visitante. Un previsualizador propio podría divergir del PDF de verdad, y
 * entonces sería peor que no tenerlo.
 */
export default async function PdfPage() {
  const [[profile], variants] = await Promise.all([
    db.select().from(schema.profile).limit(1),
    db.select().from(schema.variant).orderBy(asc(schema.variant.order)),
  ]);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[var(--step-3)] leading-tight">PDF</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Diez archivos: cinco variantes por dos idiomas. Se generan desde la base de datos y se cachean en disco
          con hash de la última edición, así que publicar los regenera solos.
        </p>
        <p className="mt-2 max-w-2xl text-[var(--step--1)] text-[var(--muted)]">
          Última edición del contenido:{' '}
          <time className="tabular font-mono text-[var(--text)]" dateTime={profile?.updatedAt.toISOString()}>
            {profile?.updatedAt.toISOString().slice(0, 16).replace('T', ' ') ?? '—'}
          </time>
        </p>
      </header>

      <table className="w-full max-w-3xl text-left">
        <thead>
          <tr className="border-b border-[var(--line)] font-mono text-[0.7rem] uppercase tracking-wide text-[var(--muted)]">
            <th scope="col" className="py-2 pr-4 font-normal">Variante</th>
            <th scope="col" className="py-2 pr-4 font-normal">Español</th>
            <th scope="col" className="py-2 font-normal">Inglés</th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <tr key={v.id} className="border-b border-[var(--line)]">
              <td className="py-3 pr-4">
                <span className="font-mono text-[var(--step--1)]">{v.slug}</span>
                {v.isDefault ? (
                  <span className="ml-2 font-mono text-[0.7rem] text-[var(--muted)]">defecto</span>
                ) : null}
              </td>
              {(['es', 'en'] as const).map((lang) => (
                <td key={lang} className="py-3 pr-4">
                  <a
                    href={`/cv.pdf?v=${v.slug}&lang=${lang}`}
                    target="_blank"
                    rel="noopener"
                    className="text-[var(--step--1)] text-[var(--signal)] hover:text-[var(--phosphor)]"
                  >
                    {lang === 'es' ? v.pdfFileNameEs : v.pdfFileNameEn}
                  </a>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-10 max-w-2xl">
        <h2 className="text-[var(--step-1)]">Qué revisar antes de enviarlo</h2>
        <ul className="mt-4 space-y-2 text-[var(--step--1)] text-[var(--muted)]">
          <li>· El texto se puede seleccionar y copiar. Si no, un ATS no lo lee.</li>
          <li>· Los enlaces abren de verdad.</li>
          <li>· Cabe en una o dos páginas.</li>
          <li>· El nombre del archivo corresponde a la variante y al idioma.</li>
          <li>· Ninguna cifra aparece sin estar confirmada.</li>
        </ul>
      </section>
    </>
  );
}
