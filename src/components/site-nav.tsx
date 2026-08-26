'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Barra de navegación que aparece cuando el titular sale por arriba.
 *
 * Arriba del todo estorba: la consola ya dice quién es y a dónde ir. Solo
 * cuando el H1 se va de la pantalla el lector pierde ese contexto, y ahí entra
 * la barra con las secciones y la búsqueda.
 *
 * Va `fixed`, no `sticky`: así no reserva espacio en el flujo y no hay salto
 * de maquetación al aparecer. Lo que sí necesita es que los destinos tengan
 * `scroll-mt-*`, o el anclaje dejaría el título debajo de la barra.
 *
 * Mientras está fuera de pantalla queda `inert`: sus enlaces no reciben foco
 * con el tabulador, que si no sería navegar a ciegas.
 */

export const SEARCH_EVENT = 'cv:search';

type Props = {
  sections: { id: string; label: string }[];
  labels: { search: string; sections: string };
  /** Elemento que, al salir por arriba, hace aparecer la barra. */
  sentinel: string;
};

export function SiteNav({ sections, labels, sentinel }: Props) {
  const [past, setPast] = useState(false);
  const [query, setQuery] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLUListElement>(null);

  const open = (q = '') => {
    setQuery(q);
    requestAnimationFrame(() => inputRef.current?.focus());
  };

  useEffect(() => {
    const mark = document.getElementById(sentinel);
    if (!mark) return;

    // Un listener de scroll y no IntersectionObserver: aquí solo hace falta el
    // signo de una coordenada, y el observer, con su callback asíncrono, deja
    // la barra medio fotograma por detrás del scroll al cruzar el umbral. El
    // navegador ya agrupa los eventos de scroll por fotograma, así que esto es
    // una lectura de geometría por fotograma como mucho.
    const read = () => setPast(mark.getBoundingClientRect().top < 0);

    read();
    window.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read, { passive: true });
    return () => {
      window.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
    };
  }, [sentinel]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const typing =
        e.target instanceof HTMLElement && ['INPUT', 'TEXTAREA'].includes(e.target.tagName);
      if (e.key === '/' && !typing) {
        e.preventDefault();
        open();
      }
      if (e.key === 'Escape') setQuery(null);
    }
    // La consola tiene su propio botón de búsqueda y vive en otra rama del
    // árbol: se avisa por evento en vez de duplicar el buscador.
    function onSearch() {
      open();
    }

    window.addEventListener('keydown', onKey);
    window.addEventListener(SEARCH_EVENT, onSearch);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(SEARCH_EVENT, onSearch);
    };
  }, []);

  /** Cierra, desplaza y deja el foco en la sección: no solo el scroll. */
  function goToSection(id: string) {
    setQuery(null);
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ block: 'start' });
    target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
    history.replaceState(null, '', `#${id}`);
  }

  const matches =
    query === null
      ? []
      : sections.filter((s) => s.label.toLowerCase().includes(query.toLowerCase()));

  // Buscar con la página aún arriba también saca la barra: si no, el panel
  // saldría de una barra invisible.
  const shown = past || query !== null;

  return (
    <div
      className={`fixed inset-x-0 top-0 z-40 border-b border-[var(--line)] bg-[var(--void)]/90 backdrop-blur transition-[transform,opacity] duration-200 ${
        shown ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-full opacity-0'
      }`}
      inert={!shown}
    >
      <div className="mx-auto flex max-w-[68rem] items-center gap-3 px-5 sm:px-8">
        <nav aria-label={labels.sections} className="min-w-0 flex-1">
          <ul className="flex gap-1 overflow-x-auto font-[family-name:var(--font-mono)] text-[var(--step--1)]">
            {sections.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    goToSection(s.id);
                  }}
                  className="block whitespace-nowrap px-2 py-4 text-[var(--muted)] hover:text-[var(--phosphor)]"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <button
          onClick={() => (query === null ? open() : setQuery(null))}
          aria-expanded={query !== null}
          className="whitespace-nowrap py-4 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)] hover:text-[var(--phosphor)]"
        >
          / {labels.search}
        </button>
      </div>

      {query !== null ? (
        <div
          className="border-t border-[var(--line)] bg-[var(--surface)]"
          onBlur={(e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) setQuery(null);
          }}
        >
          <div className="mx-auto max-w-[68rem] px-5 py-3 sm:px-8">
            <label className="sr-only" htmlFor="nav-search">
              {labels.search}
            </label>
            <input
              id="nav-search"
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && matches[0]) {
                  e.preventDefault();
                  goToSection(matches[0].id);
                }
                if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  resultsRef.current?.querySelector('a')?.focus();
                }
              }}
              className="w-full rounded border border-[var(--phosphor)] bg-[var(--void)] px-3 py-2 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--text)]"
            />
            <ul ref={resultsRef} role="listbox" aria-label={labels.search} className="mt-1">
              {matches.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      goToSection(s.id);
                    }}
                    className="block min-h-11 py-2 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--signal)]"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}
