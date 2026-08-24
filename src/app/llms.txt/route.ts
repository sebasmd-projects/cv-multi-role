import { getCv } from '@/lib/queries';
import { formatPeriod } from '@/lib/i18n';

/**
 * Resumen en texto plano para que un modelo cite con precisión en vez de
 * inferir del HTML. Se regenera con la caché `cv`, así que publicar lo actualiza.
 */
export const revalidate = 3600;

export async function GET() {
  const cv = await getCv('es', 'automatizacion');

  const lines = [
    `# ${cv.profile.fullName}`,
    '',
    `> ${cv.profile.headline}. ${cv.profile.summaryShort}`,
    '',
    `Ubicación: ${cv.profile.location}`,
    `Estado: ${cv.profile.availability}`,
    `Contacto: ${cv.profile.email}`,
    `Enlaces: ${cv.links.map((l) => `${l.label} ${l.url}`).join(' · ')}`,
    '',
    '## Perfil',
    cv.profile.summary,
    '',
    '## Experiencia',
    ...cv.experiences.flatMap((e) => [
      '',
      `### ${e.role} — ${e.company}${e.client ? ` (cliente: ${e.client})` : ''}`,
      formatPeriod(e.startDate, e.endDate, 'es'),
      e.context,
      ...e.achievements.map((a) =>
        a.metricValue
          ? `- ${a.text} [${a.metricLabel}: ${a.isApproximate ? '~' : ''}${a.metricValue}]`
          : `- ${a.text}`,
      ),
      `Tecnologías: ${e.tech.join(', ')}`,
    ]),
    '',
    '## Habilidades',
    ...cv.skillGroups.map((g) => `- ${g.name}: ${g.skills.map((s) => s.name).join(', ')}`),
    '',
    '## Muestra de trabajo',
    ...cv.projects.map((p) => `- ${p.title}: ${p.result}`),
    '',
    '## Formación',
    ...cv.education.map((e) => `- ${e.title}, ${e.institution} (${formatPeriod(e.startDate, e.endDate, 'es')})`),
    ...cv.certifications.map((c) => `- ${c.name}, ${c.institution}`),
    '',
    '## Idiomas',
    ...cv.languages.map((l) => `- ${l.name}: ${l.level}`),
    '',
    `Versión en inglés: ${process.env.SITE_URL ?? 'https://sebasmoralesd.com'}/en`,
  ];

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
