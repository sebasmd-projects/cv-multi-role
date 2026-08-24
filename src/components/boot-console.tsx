'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/**
 * ELEMENTO FIRMA (§7). Aquí se gasta toda la audacia; el resto de la página
 * se mantiene callado.
 *
 * Es un componente de cliente, pero su contenido se renderiza en el servidor:
 * sin JavaScript, la consola aparece completa y legible. El tecleo línea a
 * línea es CSS con retardo escalonado, así que también funciona sin JS y se
 * apaga entero bajo `prefers-reduced-motion`.
 *
 * Lo que sí necesita JS —la búsqueda con «/» y las flechas— degrada en
 * silencio: el conmutador de variante son enlaces reales.
 */

export type ConsoleLine = { label: string; value: string; approx?: boolean };

type Props = {
  boot: string;
  lines: ConsoleLine[];
  variants: { slug: string; label: string; href: string }[];
  activeSlug: string;
  labels: { switchVariant: string; download: string; write: string; search: string };
  downloadHref: string;
  mailtoHref: string;
  sections: { id: string; label: string }[];
};

export function BootConsole({
  boot, lines, variants, activeSlug, labels, downloadHref, mailtoHref, sections,
}: Props) {
  const router = useRouter();
  const [query, setQuery] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typingElsewhere =
        e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

      if (e.key === '/' && !typingElsewhere) {
        e.preventDefault();
        setQuery('');
        requestAnimationFrame(() => searchRef.current?.focus());
      }
      if (e.key === 'Escape') setQuery(null);

      if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && !typingElsewhere) {
        const i = variants.findIndex((v) => v.slug === activeSlug);
        const next = e.key === 'ArrowRight' ? i + 1 : i - 1;
        const target = variants[(next + variants.length) % variants.length];
        if (target) router.push(target.href);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeSlug, variants, router]);

  const matches =
    query === null
      ? []
      : sections.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="console rounded border border-[var(--line)] bg-[var(--surface)] p-4 font-mono text-[var(--step--1)] sm:p-6">
      <p className="text-[var(--phosphor)]">
        <span aria-hidden="true">&gt; </span>
        {boot}
      </p>

      <dl className="mt-3">
        {lines.map((l, i) => (
          <div
            key={l.label}
            className="console-line flex justify-between gap-4 py-0.5"
            style={{ '--i': i } as React.CSSProperties}
          >
            <dt className="text-[var(--muted)]">{l.label}</dt>
            <dd className="tabular text-right text-[var(--text)]">
              {l.approx ? <span aria-hidden="true">~</span> : null}
              {l.value}
              {l.approx ? <span className="sr-only"> (estimado)</span> : null}
            </dd>
          </div>
        ))}
      </dl>

      <nav aria-label={labels.switchVariant} className="mt-5 flex flex-wrap items-center gap-2">
        <span className="text-[var(--muted)]">{labels.switchVariant}:</span>
        {variants.map((v) => {
          const on = v.slug === activeSlug;
          return (
            <a
              key={v.slug}
              href={v.href}
              aria-current={on ? 'page' : undefined}
              className={`min-h-11 rounded px-2 py-2 transition-colors ${
                on ? 'text-[var(--phosphor)] underline underline-offset-4' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {on ? `[${v.label}]` : v.label}
            </a>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-4">
        <span className="text-[var(--phosphor)]" aria-hidden="true">
          &gt; <span className="caret">▍</span>
        </span>
        <a href={downloadHref} className="min-h-11 py-2 text-[var(--signal)] hover:text-[var(--phosphor)]">
          {labels.download}
        </a>
        <a href={mailtoHref} className="min-h-11 py-2 text-[var(--signal)] hover:text-[var(--phosphor)]">
          {labels.write}
        </a>
        <button
          onClick={() => {
            setQuery('');
            requestAnimationFrame(() => searchRef.current?.focus());
          }}
          className="min-h-11 py-2 text-[var(--muted)] hover:text-[var(--phosphor)]"
        >
          / {labels.search}
        </button>
      </div>

      {query !== null ? (
        <div className="mt-3">
          <label className="sr-only" htmlFor="console-search">
            {labels.search}
          </label>
          <input
            id="console-search"
            ref={searchRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onBlur={() => !query && setQuery(null)}
            className="w-full rounded border border-[var(--phosphor)] bg-[var(--void)] px-3 py-2 text-[var(--text)]"
          />
          <ul className="mt-2" role="listbox" aria-label={labels.search}>
            {matches.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setQuery(null)}
                  className="block min-h-11 py-2 text-[var(--signal)]"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
