import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CvPage } from '@/components/cv-page';
import { getCv, getVariantSlugs } from '@/lib/queries';
import { cvMetadata } from '@/lib/seo';
import { DEFAULT_LOCALE, isLocale, LOCALES, type Locale } from '@/lib/i18n';

/** Las variantes tienen canonical a `/`: son la misma persona reordenada,
 *  no cinco páginas distintas que compitan entre sí en el buscador. */
export async function generateStaticParams() {
  const slugs = await getVariantSlugs();
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const cv = await getCv(l, slug);
  // canonical → raíz del idioma, no a /v/[slug]
  return { ...cvMetadata(cv, l === 'en' ? '/en' : '/'), robots: { index: false, follow: true } };
}

export default async function VariantPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const slugs = await getVariantSlugs();
  if (!slugs.includes(slug)) notFound();
  return <CvPage locale={isLocale(locale) ? locale : DEFAULT_LOCALE} variantSlug={slug} />;
}
