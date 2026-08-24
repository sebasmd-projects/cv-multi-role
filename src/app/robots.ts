import type { MetadataRoute } from 'next';
import { db, schema } from '@/db/client';

const SITE = process.env.SITE_URL ?? 'https://sebasmoralesd.com';

/**
 * Las políticas de crawlers de IA se editan desde /admin/seo y viven en
 * `setting.ai_crawlers`. Permitidos por defecto: un CV quiere que un asistente
 * lo cite. El único que nunca se abre es /admin.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  const rows = await db.select().from(schema.setting);
  const policies = (rows.find((r) => r.key === 'ai_crawlers')?.value ?? {}) as Record<string, 'allow' | 'disallow'>;

  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
      ...Object.entries(policies).map(([userAgent, policy]) => ({
        userAgent,
        ...(policy === 'allow' ? { allow: '/' } : { disallow: '/' }),
        disallow: policy === 'allow' ? ['/admin', '/api/'] : '/',
      })),
    ],
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
