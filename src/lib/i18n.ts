import 'server-only';
import { headers } from 'next/headers';

export const LOCALES = ['es', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'es';

export function isLocale(v: string | undefined): v is Locale {
  return !!v && (LOCALES as readonly string[]).includes(v);
}

/** El idioma lo resuelve `proxy.ts` y lo pasa por cabecera. */
export async function getLocale(): Promise<Locale> {
  const h = await headers();
  const l = h.get('x-locale');
  return isLocale(l ?? undefined) ? (l as Locale) : DEFAULT_LOCALE;
}

/** Ruta equivalente en el otro idioma, para `hreflang` y el conmutador. */
export function pathForLocale(pathname: string, locale: Locale): string {
  const clean = pathname.replace(/^\/en(?=\/|$)/, '') || '/';
  return locale === 'en' ? (clean === '/' ? '/en' : `/en${clean}`) : clean;
}

/**
 * Cadenas de la interfaz. No confundir con el CONTENIDO del CV, que vive en
 * base de datos: esto son etiquetas, botones y estados vacíos.
 */
export const ui = {
  es: {
    nav: { profile: 'Perfil', experience: 'Trayectoria', work: 'Trabajo', contact: 'Contacto' },
    downloadCv: 'Descargar CV',
    write: 'Escribir',
    search: 'Buscar sección',
    copy: 'Copiar',
    copied: 'Copiado',
    switchVariant: 'Ver este CV como',
    switchLocale: 'English',
    present: 'Actualidad',
    approx: 'estimado',
    caseStudy: 'Caso de estudio',
    problem: 'El problema',
    decision: 'La decisión',
    architecture: 'La arquitectura',
    result: 'El resultado',
    learning: 'Lo que aprendí',
    confidential: 'Proyecto de cliente · presentado sin datos identificables',
    tiers: { nucleo: 'núcleo', solido: 'sólido', en_uso: 'en uso' } as const,
    sections: {
      experience: 'Experiencia',
      skills: 'Habilidades',
      projects: 'Muestra de trabajo',
      education: 'Educación',
      languages: 'Idiomas',
    },
    privacy: 'Este sitio no usa cookies ni guarda direcciones IP. Solo cuenta páginas vistas y descargas.',
    emptyProjects: 'Todavía no hay casos de estudio publicados.',
    error: 'Algo falló al cargar esta sección. Recarga la página.',
  },
  en: {
    nav: { profile: 'Profile', experience: 'Career', work: 'Work', contact: 'Contact' },
    downloadCv: 'Download CV',
    write: 'Get in touch',
    search: 'Find a section',
    copy: 'Copy',
    copied: 'Copied',
    switchVariant: 'View this CV as',
    switchLocale: 'Español',
    present: 'Present',
    approx: 'estimated',
    caseStudy: 'Case study',
    problem: 'The problem',
    decision: 'The decision',
    architecture: 'The architecture',
    result: 'The result',
    learning: 'What I learned',
    confidential: 'Client project · presented without identifying data',
    tiers: { nucleo: 'core', solido: 'strong', en_uso: 'in use' } as const,
    sections: {
      experience: 'Experience',
      skills: 'Skills',
      projects: 'Selected work',
      education: 'Education',
      languages: 'Languages',
    },
    privacy: 'This site uses no cookies and stores no IP addresses. It counts page views and downloads, nothing else.',
    emptyProjects: 'No case studies published yet.',
    error: 'This section failed to load. Reload the page.',
  },
} as const;

export type Ui = (typeof ui)['es'];

/** Formatea 'YYYY-MM' según idioma. `null` en endDate = puesto actual. */
export function formatPeriod(start: string, end: string | null, locale: Locale): string {
  const fmt = (ym: string) => {
    const [y, m] = ym.split('-').map(Number);
    return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'es-CO', {
      month: 'short',
      year: 'numeric',
    }).format(new Date(y!, m! - 1, 1));
  };
  return `${fmt(start)} – ${end ? fmt(end) : ui[locale].present}`;
}
