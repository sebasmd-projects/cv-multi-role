import type { MetadataRoute } from 'next';
import { getCv, getVariantSlugs } from '@/lib/queries';

const SITE = process.env.SITE_URL ?? 'https://sebasmoralesd.com';

/** Generado desde base de datos: publicar un caso de estudio lo añade solo. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [cv, slugs] = await Promise.all([getCv('es', 'automatizacion'), getVariantSlugs()]);
  const lastModified = cv.profile.updatedAt;

  const entry = (path: string, priority: number) => ({
    url: `${SITE}${path}`,
    lastModified,
    priority,
    alternates: {
      languages: {
        es: `${SITE}${path}`,
        en: `${SITE}/en${path === '/' ? '' : path}`,
      },
    },
  });

  return [
    entry('/', 1),
    ...cv.projects.map((p) => entry(`/proyecto/${p.slug}`, 0.7)),
    // Las variantes quedan fuera: llevan canonical a `/` y noindex.
    ...(slugs.length ? [] : []),
  ];
}
