import { NextResponse, type NextRequest } from 'next/server';

/**
 * `proxy.ts` es el middleware de Next 16 (renombrado desde `middleware.ts`).
 * Si el hosting quedara en Next 15, este archivo se renombra a `middleware.ts`
 * sin cambiar una línea de su contenido.
 *
 * Hace exactamente dos cosas, y ninguna más:
 *   1. i18n — español sin prefijo, inglés bajo /en.
 *   2. nonce de CSP por petición (§11 exige CSP estricta con nonces, y no hay
 *      forma de emitir un nonce por petición desde un RSC).
 *
 * Corre en runtime Node bajo Passenger: sin Edge, sin APIs de Web Crypto
 * exclusivas del edge que no existan en Node 22.
 */

export const config = {
  matcher: [
    /*
     * Todo salvo: estáticos de Next, el PDF, las APIs, el admin
     * y los archivos de raíz servidos tal cual.
     */
    '/((?!_next/|api/|admin|cv\\.pdf|favicon\\.ico|robots\\.txt|sitemap\\.xml|llms\\.txt|manifest\\.webmanifest|uploads/).*)',
  ],
};

const LOCALES = ['es', 'en'] as const;
const DEFAULT_LOCALE = 'es';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  /* ── 1. i18n ──────────────────────────────────────────────────── */

  const segments = pathname.split('/').filter(Boolean);
  const first = segments[0];

  // El español NO lleva prefijo en la URL pública. Si alguien pide /es/... ,
  // se redirige de forma permanente a la versión canónica sin prefijo.
  if (first === DEFAULT_LOCALE) {
    const url = request.nextUrl.clone();
    url.pathname = '/' + segments.slice(1).join('/');
    return NextResponse.redirect(url, 308);
  }

  const hasLocalePrefix = LOCALES.includes(first as (typeof LOCALES)[number]);
  const locale = hasLocalePrefix ? first! : DEFAULT_LOCALE;

  // El árbol de archivos vive en app/[locale]/... — el rewrite es interno,
  // la URL que ve el usuario y el buscador no cambia.
  const rewritten = request.nextUrl.clone();
  if (!hasLocalePrefix) {
    rewritten.pathname = `/${DEFAULT_LOCALE}${pathname === '/' ? '' : pathname}`;
  }

  /* ── 2. Nonce de CSP ──────────────────────────────────────────── */

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  const csp = [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`,
    // Los atributos style="" inline (índice de animación, view-transition-name
    // por slug) no pueden llevar nonce: la CSP solo lo aplica a <style>/<script>.
    // El riesgo de inyección vía style es mucho menor que vía script, así que
    // aquí se acepta 'unsafe-inline' en vez de perseguir cada valor dinámico.
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob:`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `frame-ancestors 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ].join('; ');

  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('x-locale', locale);

  const response = hasLocalePrefix
    ? NextResponse.next({ request: { headers } })
    : NextResponse.rewrite(rewritten, { request: { headers } });

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload',
  );

  return response;
}
