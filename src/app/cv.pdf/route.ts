import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { renderToBuffer } from '@react-pdf/renderer';
import { z } from 'zod';
import { CvDocument } from '@/pdf/cv-document';
import { getCv, getVariantSlugs } from '@/lib/queries';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';
import { db, schema } from '@/db/client';
import { hit } from '@/lib/rate-limit';

/**
 * Diez artefactos posibles (5 variantes × 2 idiomas), cacheados en disco con
 * hash de `updatedAt`. Renderizar un PDF es la operación más cara del sitio y
 * bajo Passenger comparte proceso con todo lo demás: sin caché, un bot que
 * pidiera /cv.pdf en bucle tumbaría la web entera.
 */

export const dynamic = 'force-dynamic';

const params = z.object({
  v: z.string().max(40).optional(),
  lang: z.string().max(2).optional(),
});

export async function GET(request: Request) {
  const url = new URL(request.url);
  const parsed = params.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return new Response('Parámetros no válidos.', { status: 400 });
  }

  if (!hit(`pdf:${request.headers.get('x-forwarded-for') ?? 'local'}`, 10, 60_000)) {
    return new Response('Demasiadas descargas seguidas. Espera un minuto.', { status: 429 });
  }

  const locale: Locale = isLocale(parsed.data.lang) ? parsed.data.lang : DEFAULT_LOCALE;
  const slugs = await getVariantSlugs();
  const variantSlug = parsed.data.v && slugs.includes(parsed.data.v) ? parsed.data.v : 'automatizacion';

  const cv = await getCv(locale, variantSlug);
  const fileName = locale === 'en' ? cv.variant.pdfFileNameEn : cv.variant.pdfFileNameEs;

  // `getCv` pasa por `unstable_cache`, que serializa el resultado a JSON:
  // `updatedAt` llega como string, no como Date, así que se normaliza aquí.
  const hash = createHash('sha1')
    .update(`${variantSlug}|${locale}|${new Date(cv.profile.updatedAt).toISOString()}`)
    .digest('hex')
    .slice(0, 12);

  const dir = process.env.PDF_CACHE_DIR ?? '/tmp/pdf-cache';
  const cached = join(dir, `${variantSlug}-${locale}-${hash}.pdf`);

  let buffer: Buffer;
  try {
    buffer = await readFile(cached);
  } catch {
    buffer = await renderToBuffer(CvDocument({ cv, locale }));
    try {
      await mkdir(dir, { recursive: true });
      await writeFile(cached, buffer);
    } catch {
      // Sin permisos de escritura el PDF se sirve igual, solo sin caché.
    }
  }

  await db.insert(schema.event).values({
    type: 'pdf_download',
    path: '/cv.pdf',
    variantSlug,
    locale,
    referrer: request.headers.get('referer')?.slice(0, 255) ?? null,
  });

  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="${fileName}"`,
      'Cache-Control': 'public, max-age=3600',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
