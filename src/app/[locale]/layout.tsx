import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { body, display, mono } from '@/lib/fonts';
import { isLocale, LOCALES } from '@/lib/i18n';
import '../globals.css';

export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  // El nonce lo emite proxy.ts por petición. Sin él, la CSP estricta
  // bloquearía el JSON-LD y el runtime de Next.
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  return (
    <html lang={locale} className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="font-[family-name:var(--font-body)]" data-nonce={nonce}>
        <a
          href="#contenido"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-[var(--phosphor)] focus:px-4 focus:py-2 focus:text-[var(--void)]"
        >
          {locale === 'en' ? 'Skip to content' : 'Saltar al contenido'}
        </a>
        {children}
      </body>
    </html>
  );
}
