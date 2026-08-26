'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { SEARCH_EVENT } from './site-nav';

/**
 * ELEMENTO FIRMA (§7). Aquí se gasta toda la audacia; el resto de la página
 * se mantiene callado.
 *
 * Es un componente de cliente, pero su contenido se renderiza en el servidor:
 * sin JavaScript, la consola aparece completa y legible. El tecleo línea a
 * línea es CSS con retardo escalonado, así que también funciona sin JS y se
 * apaga entero bajo `prefers-reduced-motion`.
 *
 * Lo que sí necesita JS —las flechas para cambiar de variante— degrada en
 * silencio: el conmutador son enlaces reales. La búsqueda vive en la barra
 * superior; aquí solo está el botón que la abre.
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
};

export function BootConsole({
  boot, lines, variants, activeSlug, labels, downloadHref, mailtoHref,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typingElsewhere =
        e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

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
            <Link
              key={v.slug}
              href={v.href}
              prefetch
              aria-current={on ? 'page' : undefined}
              className={`min-h-11 rounded px-2 py-2 transition-colors ${
                on ? 'text-[var(--phosphor)] underline underline-offset-4' : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              {on ? `[${v.label}]` : v.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--line)] pt-4">
        <span className="text-[var(--phosphor)]" aria-hidden="true">
          &gt; <span className="caret" />
        </span>
        {/* El PDF se abre aparte: descargarlo no debe sacar a nadie del CV. */}
        <a
          href={downloadHref}
          target="_blank"
          rel="noopener"
          className="min-h-11 py-2 text-[var(--signal)] hover:text-[var(--phosphor)]"
        >
          {labels.download}
        </a>
        <a href={mailtoHref} className="min-h-11 py-2 text-[var(--signal)] hover:text-[var(--phosphor)]">
          {labels.write}
        </a>
        <button
          onClick={() => window.dispatchEvent(new CustomEvent(SEARCH_EVENT))}
          className="min-h-11 py-2 text-[var(--muted)] hover:text-[var(--phosphor)]"
        >
          / {labels.search}
        </button>
      </div>

    </div>
  );
}
