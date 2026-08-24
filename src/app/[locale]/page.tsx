import type { Metadata } from 'next';
import { CvPage } from '@/components/cv-page';
import { getCv } from '@/lib/queries';
import { cvMetadata } from '@/lib/seo';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/lib/i18n';

const DEFAULT_VARIANT = 'automatizacion';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const cv = await getCv(l, DEFAULT_VARIANT);
  return cvMetadata(cv, l === 'en' ? '/en' : '/');
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <CvPage locale={isLocale(locale) ? locale : DEFAULT_LOCALE} variantSlug={DEFAULT_VARIANT} />;
}
