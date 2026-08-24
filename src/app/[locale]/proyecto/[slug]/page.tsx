import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { getCv } from '@/lib/queries';
import { alternates, projectJsonLd } from '@/lib/seo';
import { DEFAULT_LOCALE, isLocale, ui, type Locale } from '@/lib/i18n';

const SITE = process.env.SITE_URL ?? 'https://sebasmoralesd.com';

async function load(locale: Locale, slug: string) {
  const cv = await getCv(locale, 'automatizacion');
  const project = cv.projects.find((p) => p.slug === slug);
  return { cv, project };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const { cv, project } = await load(l, slug);
  if (!project) return {};

  const path = l === 'en' ? `/en/proyecto/${slug}` : `/proyecto/${slug}`;
  return {
    metadataBase: new URL(SITE),
    title: `${project.title} — ${cv.profile.fullName}`,
    description: project.problem.slice(0, 155),
    alternates: alternates(path),
    openGraph: { title: project.title, description: project.problem.slice(0, 155), type: 'article' },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const l: Locale = isLocale(locale) ? locale : DEFAULT_LOCALE;
  const { cv, project } = await load(l, slug);
  if (!project) notFound();

  const t = ui[l];
  const nonce = (await headers()).get('x-nonce') ?? undefined;

  // Estructura fija (§2.5). Sin numerar: no es una secuencia que el lector
  // deba seguir en orden, es un argumento.
  const parts = [
    [t.problem, project.problem],
    [t.decision, project.decision],
    [t.architecture, project.architecture],
    [t.result, project.result],
    [t.learning, project.learning],
  ] as const;

  return (
    <>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd(cv, project)) }}
      />

      <div className="mx-auto max-w-[46rem] px-5 py-10 sm:px-8">
        <Link
          href={l === 'en' ? '/en' : '/'}
          className="font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)] hover:text-[var(--phosphor)]"
        >
          <span aria-hidden="true">← </span>
          {cv.profile.fullName}
        </Link>

        <main id="contenido" className="mt-10">
          <p className="font-[family-name:var(--font-mono)] text-[var(--step--1)] uppercase tracking-[0.2em] text-[var(--muted)]">
            {t.caseStudy}
          </p>

          <h1
            className="mt-3 font-[family-name:var(--font-display)] text-[var(--step-3)] font-semibold leading-[1.1] [font-variation-settings:'wdth'_120]"
            style={{ viewTransitionName: `project-${project.slug}` }}
          >
            {project.title}
          </h1>

          {project.isConfidential ? (
            <p className="mt-4 border-l-2 border-[var(--line)] pl-4 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)]">
              {t.confidential}
            </p>
          ) : null}

          <div className="mt-12 space-y-12">
            {parts.map(([label, text]) => (
              <section key={label}>
                <h2 className="mb-3 font-[family-name:var(--font-mono)] text-[var(--step--1)] uppercase tracking-[0.2em] text-[var(--phosphor)]">
                  {label}
                </h2>
                <p className="leading-relaxed">{text}</p>
              </section>
            ))}
          </div>

          {project.repoUrl || project.liveUrl ? (
            <div className="mt-12 flex gap-6 border-t border-[var(--line)] pt-6">
              {project.repoUrl ? (
                <a href={project.repoUrl} rel="noopener" className="text-[var(--signal)] hover:text-[var(--phosphor)]">
                  {l === 'en' ? 'Source code' : 'Código fuente'}
                </a>
              ) : null}
              {project.liveUrl ? (
                <a href={project.liveUrl} rel="noopener" className="text-[var(--signal)] hover:text-[var(--phosphor)]">
                  {l === 'en' ? 'Live site' : 'Sitio en vivo'}
                </a>
              ) : null}
            </div>
          ) : null}
        </main>
      </div>
    </>
  );
}
