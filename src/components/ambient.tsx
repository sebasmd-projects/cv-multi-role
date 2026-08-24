'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

/**
 * Pieza ambiental (§7). Una sola, y solo donde se puede pagar:
 *
 * - Carga diferida con `ssr: false` — no entra en el bundle inicial de `/`,
 *   así que el presupuesto de 120 KB de la página sigue intacto. El techo
 *   aprobado para esta pieza es 200 KB gzip aparte.
 * - Bajo 768 px no se carga nada: un póster estático. Un móvil de gama media
 *   no debe gastar batería en decoración.
 * - `prefers-reduced-motion` la apaga entera, no la ralentiza.
 * - Solo se monta cuando entra en viewport, para no competir con el LCP.
 *
 * Es fondo: `aria-hidden`, no aporta información que no esté en el texto.
 */

const Scene = dynamic(() => import('./ambient-scene').then((m) => m.AmbientScene), {
  ssr: false,
  loading: () => null,
});

export function Ambient() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const wide = window.matchMedia('(min-width: 768px)');
    const still = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!wide.matches || still.matches) return;

    const el = ref.current;
    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => setEnabled(!!entry?.isIntersecting),
      { rootMargin: '100px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden opacity-40"
    >
      {enabled ? <Scene /> : null}
    </div>
  );
}
