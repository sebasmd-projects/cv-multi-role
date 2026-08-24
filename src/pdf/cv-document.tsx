import { Document, Link, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { Cv } from '@/lib/queries';
import { formatPeriod, ui, type Locale } from '@/lib/i18n';

/**
 * EL PDF NO HEREDA LA ESTÉTICA DEL SITIO (§9).
 *
 * Un ATS lee este archivo antes que una persona. Eso impone: columna única
 * lógica, texto seleccionable, encabezados estándar, cero texto dentro de
 * imágenes, cero tablas de maquetación. La marca se reduce a un filete ámbar
 * y a la jerarquía tipográfica.
 */

const AMBER = '#B26B00'; // Ámbar oscurecido: sobre blanco, #FFC14D no contrasta.
const INK = '#141414';
const GREY = '#555555';

const s = StyleSheet.create({
  page: { paddingTop: 36, paddingBottom: 40, paddingHorizontal: 44, fontSize: 9.5, color: INK, lineHeight: 1.45 },
  rule: { height: 3, backgroundColor: AMBER, width: 56, marginBottom: 10 },
  name: { fontSize: 20, fontWeight: 700, letterSpacing: -0.3 },
  headline: { fontSize: 11, color: AMBER, marginTop: 2, marginBottom: 6 },
  contact: { fontSize: 8.5, color: GREY, marginBottom: 14 },
  h2: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginTop: 14, marginBottom: 6, borderBottomWidth: 0.75, borderBottomColor: '#DDDDDD', paddingBottom: 3 },
  role: { fontSize: 10.5, fontWeight: 700 },
  company: { fontSize: 9.5, color: GREY, marginBottom: 1 },
  dates: { fontSize: 8.5, color: GREY, marginBottom: 3 },
  bullet: { flexDirection: 'row', marginBottom: 2.5 },
  dot: { width: 8, color: AMBER },
  metric: { fontWeight: 700 },
  tech: { fontSize: 8.5, color: GREY, marginTop: 3 },
  block: { marginBottom: 10 },
  link: { color: AMBER, textDecoration: 'none' },
});

export function CvDocument({ cv, locale }: { cv: Cv; locale: Locale }) {
  const t = ui[locale];
  const site = process.env.SITE_URL ?? 'https://sebasmoralesd.com';

  return (
    <Document
      title={`${cv.profile.fullName} — ${cv.profile.headline}`}
      author={cv.profile.fullName}
      subject={cv.profile.summaryShort}
      keywords={((cv.settings.knows_about as Record<string, string[]>)?.[locale] ?? []).join(', ')}
      language={locale}
    >
      <Page size="A4" style={s.page}>
        <View style={s.rule} />
        <Text style={s.name}>{cv.profile.fullName}</Text>
        <Text style={s.headline}>{cv.profile.headline}</Text>

        <Text style={s.contact}>
          {cv.profile.email}
          {cv.profile.phone ? ` · ${cv.profile.phone}` : ''} · {cv.profile.location}
          {'\n'}
          {cv.links.map((l) => l.url).join(' · ')}
        </Text>

        <Text style={s.h2}>{locale === 'en' ? 'Profile' : 'Perfil'}</Text>
        <Text>{cv.profile.summary}</Text>

        <Text style={s.h2}>{t.sections.experience}</Text>
        {cv.experiences.map((e) => (
          <View key={e.id} style={s.block} wrap={false}>
            <Text style={s.role}>{e.role}</Text>
            <Text style={s.company}>
              {e.company}
              {e.client ? ` — ${locale === 'en' ? 'client' : 'cliente'}: ${e.client}` : ''}
            </Text>
            <Text style={s.dates}>{formatPeriod(e.startDate, e.endDate, locale)}</Text>

            {e.achievements.map((a) => (
              <View key={a.id} style={s.bullet}>
                <Text style={s.dot}>·</Text>
                <Text style={{ flex: 1 }}>
                  {a.text}
                  {a.metricValue ? (
                    <Text style={s.metric}>
                      {` (${a.metricLabel}: ${a.isApproximate ? '~' : ''}${a.metricValue})`}
                    </Text>
                  ) : null}
                </Text>
              </View>
            ))}

            <Text style={s.tech}>{e.tech.join(' · ')}</Text>
          </View>
        ))}

        <Text style={s.h2}>{t.sections.skills}</Text>
        {cv.skillGroups.map((g) => (
          <View key={g.id} style={s.bullet}>
            <Text style={s.dot}>·</Text>
            <Text style={{ flex: 1 }}>
              <Text style={s.metric}>{g.name}: </Text>
              {g.skills.map((sk) => sk.name).join(', ')}
            </Text>
          </View>
        ))}

        <Text style={s.h2}>{t.sections.education}</Text>
        {cv.education.map((e) => (
          <View key={e.id} style={s.bullet}>
            <Text style={s.dot}>·</Text>
            <Text style={{ flex: 1 }}>
              <Text style={s.metric}>{e.title}</Text>
              {` — ${e.institution}, ${formatPeriod(e.startDate, e.endDate, locale)}`}
            </Text>
          </View>
        ))}
        {cv.certifications.map((c) => (
          <View key={c.id} style={s.bullet}>
            <Text style={s.dot}>·</Text>
            <Text style={{ flex: 1 }}>{`${c.name} — ${c.institution}`}</Text>
          </View>
        ))}

        <Text style={s.h2}>{t.sections.languages}</Text>
        <Text>{cv.languages.map((l) => `${l.name}: ${l.level}`).join(' · ')}</Text>

        {cv.projects.length > 0 ? (
          <>
            <Text style={s.h2}>{t.sections.projects}</Text>
            {cv.projects.slice(0, 4).map((p) => (
              <View key={p.id} style={s.bullet}>
                <Text style={s.dot}>·</Text>
                <Text style={{ flex: 1 }}>
                  <Text style={s.metric}>{p.title}: </Text>
                  {p.result}
                </Text>
              </View>
            ))}
            <Text style={{ ...s.tech, marginTop: 6 }}>
              {locale === 'en' ? 'Full case studies: ' : 'Casos de estudio completos: '}
              <Link src={locale === 'en' ? `${site}/en` : site} style={s.link}>
                {site.replace('https://', '')}
              </Link>
            </Text>
          </>
        ) : null}
      </Page>
    </Document>
  );
}
