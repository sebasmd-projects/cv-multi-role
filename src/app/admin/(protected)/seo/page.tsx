import { db, schema } from '@/db/client';
import { CrawlerPolicies } from './crawler-policies';

export const dynamic = 'force-dynamic';

const CRAWLERS = ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'CCBot', 'Bytespider'] as const;

export default async function SeoPage() {
  const rows = await db.select().from(schema.setting);
  const saved = (rows.find((r) => r.key === 'ai_crawlers')?.value ?? {}) as Record<string, 'allow' | 'disallow'>;
  const policies = Object.fromEntries(CRAWLERS.map((c) => [c, saved[c] ?? 'allow'])) as Record<
    (typeof CRAWLERS)[number],
    'allow' | 'disallow'
  >;

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[var(--step-3)] leading-tight">SEO y crawlers</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Permitidos por defecto: un CV quiere que un asistente lo cite. `/admin` queda bloqueado para todos,
          siempre.
        </p>
      </header>

      <CrawlerPolicies initial={policies} />

      <section className="mt-10 max-w-2xl">
        <h2 className="text-[var(--step-1)]">Qué se genera solo</h2>
        <ul className="mt-4 space-y-3 text-[var(--step--1)] text-[var(--muted)]">
          <li>
            <span className="font-mono text-[var(--text)]">/robots.txt</span> — desde estas políticas, sin
            redesplegar.
          </li>
          <li>
            <span className="font-mono text-[var(--text)]">/sitemap.xml</span> — desde base de datos, con
            alternates es/en. Las variantes quedan fuera: llevan canonical a `/` y noindex, para que las cinco no
            compitan entre sí.
          </li>
          <li>
            <span className="font-mono text-[var(--text)]">/llms.txt</span> — resumen en texto plano para que un
            modelo cite con precisión en vez de inferir del HTML.
          </li>
          <li>JSON-LD `Person` y `ProfilePage` en el CV; `CreativeWork` en cada caso de estudio.</li>
        </ul>
      </section>
    </>
  );
}
