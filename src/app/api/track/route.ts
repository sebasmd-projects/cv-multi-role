import { z } from 'zod';
import { db, schema } from '@/db/client';
import { hit } from '@/lib/rate-limit';

/**
 * Analítica sin cookies, sin IP almacenada y sin país (decisión 3).
 *
 * La cabecera de IP se usa SOLO como llave del limitador, en memoria, y nunca
 * toca la base de datos. Lo que se guarda es: qué tipo de evento, en qué ruta,
 * con qué variante e idioma, y de dónde venía el enlace.
 */

const input = z.object({
  type: z.enum(['view', 'pdf_download', 'link_click', 'project_view', 'variant_switch', 'locale_switch']),
  path: z.string().max(255),
  variantSlug: z.string().max(40).nullish(),
  locale: z.enum(['es', 'en']).default('es'),
  referrer: z.string().max(255).nullish(),
});

export async function POST(request: Request) {
  const key = request.headers.get('x-forwarded-for') ?? 'local';
  if (!hit(`track:${key}`, 60, 60_000)) {
    return new Response(null, { status: 429 });
  }

  const parsed = input.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return new Response(null, { status: 400 });

  await db.insert(schema.event).values({
    type: parsed.data.type,
    path: parsed.data.path,
    variantSlug: parsed.data.variantSlug ?? null,
    locale: parsed.data.locale,
    referrer: parsed.data.referrer ?? null,
  });

  return new Response(null, { status: 204 });
}
