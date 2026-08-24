import Link from 'next/link';
import type { Cv } from '@/lib/queries';
import { formatPeriod, ui, type Locale } from '@/lib/i18n';

/**
 * Todo esto es servidor: cero JavaScript de cliente.
 *
 * La numeración solo aparece en la trayectoria, que es la única secuencia real
 * de la página (§7). Las habilidades y los proyectos no se numeran porque su
 * orden no significa nada para quien lee.
 */

function SectionHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2
      id={id}
      className="mb-8 font-[family-name:var(--font-mono)] text-[var(--step--1)] uppercase tracking-[0.2em] text-[var(--muted)]"
    >
      {children}
    </h2>
  );
}

export function Timeline({ cv }: { cv: Cv }) {
  const t = ui[cv.locale as Locale];

  return (
    <section aria-labelledby="experiencia" className="border-t border-[var(--line)] py-16">
      <SectionHeading id="experiencia">{t.sections.experience}</SectionHeading>

      <ol className="space-y-16">
        {cv.experiences.map((e, i) => (
          <li key={e.id} className="grid gap-6 md:grid-cols-[3rem_1fr]">
            <span
              aria-hidden="true"
              className="tabular font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)]"
            >
              {String(i + 1).padStart(2, '0')}
            </span>

            <div>
              <h3 className="text-[var(--step-1)]">
                {e.role}
                <span className="block text-[var(--muted)]">
                  {e.company}
                  {e.client ? ` · ${e.client}` : ''}
                </span>
              </h3>

              <p className="tabular mt-1 font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)]">
                <time dateTime={e.startDate}>{formatPeriod(e.startDate, e.endDate, cv.locale)}</time>
                {' · '}
                {e.mode}
              </p>

              <p className="mt-4 max-w-2xl text-[var(--muted)]">{e.context}</p>

              {/* Las métricas van arriba: es lo que un reclutador busca primero. */}
              {e.achievements.some((a) => a.metricValue) ? (
                <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                  {e.achievements
                    .filter((a) => a.metricValue)
                    .map((a) => (
                      <div key={a.id}>
                        <dd className="tabular font-[family-name:var(--font-display)] text-[var(--step-1)] text-[var(--phosphor)]">
                          {a.isApproximate ? <span aria-hidden="true">~</span> : null}
                          {a.metricValue}
                        </dd>
                        <dt className="font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--muted)]">
                          {a.metricLabel}
                          {a.isApproximate ? ` · ${t.approx}` : ''}
                        </dt>
                      </div>
                    ))}
                </dl>
              ) : null}

              <ul className="mt-6 max-w-2xl space-y-3">
                {e.achievements.map((a) => (
                  <li key={a.id} className="grid grid-cols-[1rem_1fr] gap-2">
                    <span aria-hidden="true" className="text-[var(--phosphor)]">
                      ·
                    </span>
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>

              <ul className="mt-6 flex flex-wrap gap-x-3 gap-y-2 font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--muted)]">
                {e.tech.map((tech) => (
                  <li key={tech} className="rounded border border-[var(--line)] px-2 py-1">
                    {tech}
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function Skills({ cv }: { cv: Cv }) {
  const t = ui[cv.locale as Locale];

  return (
    <section aria-labelledby="habilidades" className="border-t border-[var(--line)] py-16">
      <SectionHeading id="habilidades">{t.sections.skills}</SectionHeading>

      <div className="grid gap-10 md:grid-cols-2">
        {cv.skillGroups.map((g) => (
          <div key={g.id}>
            <h3 className="mb-4 text-[var(--step-1)]">{g.name}</h3>
            <ul className="flex flex-wrap gap-2">
              {g.skills.map((s) => (
                <li key={s.id}>
                  {/* Tres estados, nunca porcentajes inventados (§2.4).
                      El nivel se comunica con texto además de color. */}
                  <span
                    className={`inline-flex items-center gap-2 rounded border px-2 py-1 text-[var(--step--1)] ${
                      s.tier === 'nucleo'
                        ? 'border-[var(--phosphor)] text-[var(--text)]'
                        : s.tier === 'solido'
                          ? 'border-[var(--line)] text-[var(--text)]'
                          : 'border-[var(--line)] text-[var(--muted)]'
                    }`}
                  >
                    {s.name}
                    <span className="font-[family-name:var(--font-mono)] text-[0.65rem] text-[var(--muted)]">
                      {t.tiers[s.tier]}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Work({ cv }: { cv: Cv }) {
  const t = ui[cv.locale as Locale];
  const base = cv.locale === 'en' ? '/en/proyecto' : '/proyecto';

  return (
    <section aria-labelledby="trabajo" className="border-t border-[var(--line)] py-16">
      <SectionHeading id="trabajo">{t.sections.projects}</SectionHeading>

      {cv.projects.length === 0 ? (
        <p className="text-[var(--muted)]">{t.emptyProjects}</p>
      ) : (
        <ul className="grid gap-px overflow-hidden rounded border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
          {cv.projects.map((p) => (
            <li key={p.id} className="bg-[var(--void)]">
              <Link
                href={`${base}/${p.slug}`}
                className="group flex h-full flex-col gap-3 p-6 transition-colors hover:bg-[var(--surface)]"
                style={{ viewTransitionName: `project-${p.slug}` }}
              >
                <h3 className="text-[var(--step-1)] group-hover:text-[var(--phosphor)]">{p.title}</h3>
                <p className="text-[var(--muted)]">{p.problem.split('. ')[0]}.</p>
                {p.isConfidential ? (
                  <p className="mt-auto font-[family-name:var(--font-mono)] text-[0.7rem] text-[var(--muted)]">
                    {t.confidential}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function Education({ cv }: { cv: Cv }) {
  const t = ui[cv.locale as Locale];

  return (
    <section aria-labelledby="educacion" className="border-t border-[var(--line)] py-16">
      <SectionHeading id="educacion">{t.sections.education}</SectionHeading>

      <div className="grid gap-10 md:grid-cols-2">
        <ul className="space-y-6">
          {cv.education.map((e) => (
            <li key={e.id}>
              <h3 className="text-[var(--step-1)]">{e.title}</h3>
              <p className="text-[var(--muted)]">{e.institution}</p>
              <p className="tabular font-[family-name:var(--font-mono)] text-[var(--step--1)] text-[var(--muted)]">
                <time dateTime={e.startDate}>{formatPeriod(e.startDate, e.endDate, cv.locale)}</time>
              </p>
            </li>
          ))}

          <li>
            <ul className="space-y-2">
              {cv.certifications.map((c) => (
                <li key={c.id} className="text-[var(--muted)]">
                  {c.name} <span className="text-[var(--step--1)]">· {c.institution}</span>
                </li>
              ))}
            </ul>
          </li>
        </ul>

        <div>
          <h3 className="mb-4 text-[var(--step-1)]">{t.sections.languages}</h3>
          <ul className="space-y-2">
            {cv.languages.map((l) => (
              <li key={l.id} className="flex justify-between border-b border-[var(--line)] py-2">
                <span>{l.name}</span>
                <span className="font-[family-name:var(--font-mono)] text-[var(--muted)]">{l.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

export function Contact({ cv }: { cv: Cv }) {
  const t = ui[cv.locale as Locale];

  return (
    <section aria-labelledby="contacto" className="border-t border-[var(--line)] py-16">
      <SectionHeading id="contacto">{t.nav.contact}</SectionHeading>

      <address className="not-italic">
        <ul className="flex flex-wrap gap-x-8 gap-y-3">
          <li>
            <a href={`mailto:${cv.profile.email}`} className="text-[var(--signal)] hover:text-[var(--phosphor)]">
              {cv.profile.email}
            </a>
          </li>
          {cv.profile.phone ? (
            <li>
              <a href={`tel:${cv.profile.phone.replace(/\s/g, '')}`} className="text-[var(--signal)] hover:text-[var(--phosphor)]">
                {cv.profile.phone}
              </a>
            </li>
          ) : null}
          {cv.links.map((l) => (
            <li key={l.id}>
              <a href={l.url} rel="me noopener" className="text-[var(--signal)] hover:text-[var(--phosphor)]">
                {l.label}
              </a>
            </li>
          ))}
        </ul>
      </address>

      <p className="mt-10 max-w-md text-[var(--step--1)] text-[var(--muted)]">{t.privacy}</p>
    </section>
  );
}
