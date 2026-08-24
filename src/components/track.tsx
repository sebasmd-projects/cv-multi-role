'use client';

import { useEffect } from 'react';

/**
 * Dispara un evento de vista. Se hace en cliente porque el servidor no puede
 * distinguir una visita real de un prefetch o de un bot que solo lee el HTML.
 *
 * `keepalive` para que el evento sobreviva si la persona navega enseguida.
 * Falla en silencio: la analítica nunca debe romper la página.
 */
export function Track({
  type,
  path,
  variantSlug,
  locale,
}: {
  type: 'view' | 'project_view';
  path: string;
  variantSlug?: string;
  locale: 'es' | 'en';
}) {
  useEffect(() => {
    const body = JSON.stringify({
      type,
      path,
      variantSlug: variantSlug ?? null,
      locale,
      referrer: document.referrer ? new URL(document.referrer).origin : null,
    });

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
    }).catch(() => {});
  }, [type, path, variantSlug, locale]);

  return null;
}
