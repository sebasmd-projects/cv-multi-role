import 'server-only';
import type { Metadata } from 'next';
import type { Cv } from './queries';
import { type Locale, pathForLocale } from './i18n';

const SITE = process.env.SITE_URL ?? 'https://sebasmoralesd.com';

/** Alternates recíprocos. x-default apunta al español sin prefijo. */
export function alternates(pathname: string) {
  return {
    canonical: `${SITE}${pathForLocale(pathname, 'es')}`,
    languages: {
      es: `${SITE}${pathForLocale(pathname, 'es')}`,
      en: `${SITE}${pathForLocale(pathname, 'en')}`,
      'x-default': `${SITE}${pathForLocale(pathname, 'es')}`,
    },
  };
}

export function cvMetadata(cv: Cv, pathname: string): Metadata {
  const title = `${cv.profile.fullName} — ${cv.profile.headline}`;
  const description = cv.profile.summaryShort;

  return {
    metadataBase: new URL(SITE),
    title,
    description,
    alternates: alternates(pathname),
    openGraph: {
      title,
      description,
      type: 'profile',
      locale: cv.locale === 'en' ? 'en_US' : 'es_CO',
      url: `${SITE}${pathname}`,
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: { index: true, follow: true, 'max-image-preview': 'large' },
  };
}

/** JSON-LD Person + ProfilePage. `knowsAbout` sale de ajustes, no del código. */
export function personJsonLd(cv: Cv) {
  const knows = (cv.settings.knows_about as Record<Locale, string[]> | undefined)?.[cv.locale] ?? [];
  const person = {
    '@type': 'Person',
    '@id': `${SITE}#person`,
    name: cv.profile.fullName,
    jobTitle: cv.profile.headline,
    description: cv.profile.summaryShort,
    email: `mailto:${cv.profile.email}`,
    url: SITE,
    knowsAbout: knows,
    sameAs: cv.links.filter((l) => l.kind !== 'email' && l.kind !== 'phone').map((l) => l.url),
    address: { '@type': 'PostalAddress', addressCountry: 'CO' },
    alumniOf: cv.education.map((e) => ({ '@type': 'EducationalOrganization', name: e.institution })),
    worksFor: cv.experiences.slice(0, 1).map((e) => ({ '@type': 'Organization', name: e.company })),
    knowsLanguage: cv.languages.map((l) => ({ '@type': 'Language', name: l.name, alternateName: l.level })),
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      person,
      {
        '@type': 'ProfilePage',
        '@id': `${SITE}#profilepage`,
        mainEntity: { '@id': `${SITE}#person` },
        inLanguage: cv.locale,
      },
    ],
  };
}

export function projectJsonLd(cv: Cv, project: Cv['projects'][number]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    abstract: project.problem.slice(0, 200),
    author: { '@type': 'Person', '@id': `${SITE}#person`, name: cv.profile.fullName },
    inLanguage: cv.locale,
    ...(project.repoUrl ? { codeRepository: project.repoUrl } : {}),
  };
}
