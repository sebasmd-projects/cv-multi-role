import { headers } from 'next/headers';
import { Ambient } from './ambient';
import { BootConsole, type ConsoleLine } from './boot-console';
import { Track } from './track';
import { Contact, Education, Skills, Timeline, Work } from './sections';
import { getCv } from '@/lib/queries';
import { personJsonLd } from '@/lib/seo';
import { pathForLocale, ui, type Locale } from '@/lib/i18n';

/**
 * El CV completo. `/` y `/v/[slug]` lo usan con distinta variante; `/en/...`
 * con distinto idioma. Un solo componente, para que no haya dos versiones del
 * mismo CV que puedan divergir.
 */
export async function CvPage({ locale, variantSlug }: { locale: Locale; variantSlug: string }) {
  const cv = await getCv(locale, variantSlug);
  const t = ui[locale];
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  const prefix = locale === 'en' ? '/en' : '';

  // Las cifras de la consola salen de la base de datos, nunca escritas a mano:
  // si Sebastian corrige una métrica en /admin, la consola cambia sola.
  const metrics: ConsoleLine[] = cv.experiences
    .flatMap((e) => e.achievements)
    .filter((a) => a.metricValue && a.metricLabel)
    .slice(0, 5)
    .map((a) => ({ label: a.metricLabel!, value: a.metricValue!, approx: a.isApproximate }));

  const sections = [
    { id: 'experiencia', label: t.sections.experience },
    { id: 'habilidades', label: t.sections.skills },
    { id: 'trabajo', label: t.sections.projects },
    { id: 'educacion', label: t.sections.education },
    { id: 'contacto', label: t.nav.contact },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd(cv)) }}
      />

      <Track type="view" path={prefix || '/'} variantSlug={cv.variant.slug} locale={locale} />

      <div className="relative mx-auto max-w-[68rem] px-5 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <span className="font-[family-name:var(--font-mono)] text-[var(--phosphor)]">
            SM<span aria-hidden="true">▍</span>
          </span>
          <a
            href={pathForLocale(prefix || '/', locale === 'en' ? 'es' : 'en')}
            hrefLang={locale === 'en' ? 'es' : 'en'}
            className="min-h-11 px-2 py-2 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)] hover:text-[var(--phosphor)]"
          >
            {t.switchLocale}
          </a>
        </header>

        <main id="contenido">
          <section className="relative py-8">
            <Ambient />
            <BootConsole
              boot={`init ${cv.profile.fullName.toLowerCase().replace(/\s+/g, '.')}`}
              lines={metrics}
              variants={cv.variants.map((v) => ({
                slug: v.slug,
                label: v.label,
                href: v.isDefault ? `${prefix}/` : `${prefix}/v/${v.slug}`,
              }))}
              activeSlug={cv.variant.slug}
              labels={{
                switchVariant: t.switchVariant,
                download: t.downloadCv,
                write: t.write,
                search: t.search,
              }}
              downloadHref={`/cv.pdf?v=${cv.variant.slug}&lang=${locale}`}
              mailtoHref={`mailto:${cv.profile.email}`}
              sections={sections}
            />

            <h1 className="mt-12 max-w-3xl font-[family-name:var(--font-display)] text-[var(--step-3)] font-semibold leading-[1.05] [font-variation-settings:'wdth'_120]">
              {cv.profile.headline}
            </h1>

            {cv.profile.subtitle ? (
              <p className="mt-4 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)]">
                {cv.profile.subtitle}
              </p>
            ) : null}

            <p className="mt-8 max-w-2xl text-[var(--step-1)] leading-relaxed">{cv.profile.summary}</p>

            <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)]">
              <span className="text-[var(--phosphor)]" aria-hidden="true">●</span>
              {cv.profile.availability}
              <span aria-hidden="true">·</span>
              {cv.profile.location}
            </p>
          </section>

          <Timeline cv={cv} />
          <Skills cv={cv} />
          <Work cv={cv} />
          <Education cv={cv} />
          <Contact cv={cv} />
        </main>
      </div>
    </>
  );
}
