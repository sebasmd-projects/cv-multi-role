import { ViewTransition } from 'react';
import { headers } from 'next/headers';
import { Ambient } from './ambient';
import { BootConsole, type ConsoleLine } from './boot-console';
import { BootMark } from './boot-mark';
import { SiteNav } from './site-nav';
import { TypedName } from './typed-name';
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
  const stamp = new Date().toISOString().slice(0, 7); // AAAA-MM

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

      <BootMark />

      <Track type="view" path={prefix || '/'} variantSlug={cv.variant.slug} locale={locale} />

      <SiteNav
        sections={sections}
        labels={{ search: t.search, sections: t.sections.nav }}
        sentinel="nav-sentinel"
      />

      <div className="relative mx-auto max-w-[68rem] px-5 sm:px-8">
        <header className="flex items-center justify-between py-6">
          <span className="font-[family-name:var(--font-mono)] text-[var(--phosphor)]">
            <TypedName name={cv.profile.fullName} />
          </span>
          <a
            href={pathForLocale(prefix || '/', locale === 'en' ? 'es' : 'en')}
            hrefLang={locale === 'en' ? 'es' : 'en'}
            className="inline-flex min-h-11 items-center gap-2 px-2 py-2 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)] hover:text-[var(--phosphor)]"
          >
            <Globe />
            {t.switchLocale}
          </a>
        </header>

        {/* Cambiar de variante es la misma página con otros datos: se funde en
            vez de recargar. `console-anchor` deja la consola quieta durante la
            transición, que es el ancla visual de la pantalla. */}
        <ViewTransition name="cv-body" share="cv-swap" default="none">
          <main id="contenido">
            <section className="relative py-8">
              <Ambient />
              <div style={{ viewTransitionName: 'console-anchor' }}>
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
                />
              </div>

              <div id="nav-sentinel" aria-hidden="true" className="mt-12 h-px" />

              <h1 className="max-w-3xl font-[family-name:var(--font-display)] text-[var(--step-3)] font-semibold leading-[1.05] [font-variation-settings:'wdth'_120]">
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
        </ViewTransition>

        <footer className="border-t border-[var(--line)] py-10 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)]">
          {/* El sello lleva año-mes: dice cuándo se actualizó por última vez,
              que es lo único que un aviso de copyright aporta aquí. */}
          <p className="tabular">
            © {stamp} {cv.profile.fullName}
          </p>
          <p className="mt-2 max-w-md">{t.privacy}</p>
        </footer>
      </div>
    </>
  );
}

/** Conmutador de idioma: el globo dice «idioma» antes de leer la etiqueta. */
function Globe() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3Z" />
    </svg>
  );
}
