import { ImageResponse } from 'next/og';
import { getCv } from '@/lib/queries';
import { isLocale, DEFAULT_LOCALE } from '@/lib/i18n';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'Sebastian Morales — Ingeniero de Automatización';

/**
 * La OG se genera desde base de datos: si cambia el titular o una métrica,
 * la tarjeta que ve LinkedIn cambia también. Sin fuentes externas ni imágenes
 * para que el render sea barato bajo Passenger.
 */
export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const cv = await getCv(isLocale(locale) ? locale : DEFAULT_LOCALE, 'automatizacion');

  const metrics = cv.experiences
    .flatMap((e) => e.achievements)
    .filter((a) => a.metricValue)
    .slice(0, 3);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', background: '#0A0B10', color: '#E6E8F0',
          padding: 72, fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ width: 72, height: 6, background: '#FFC14D', marginBottom: 32 }} />
          <div style={{ fontSize: 30, color: '#8A90A6' }}>{cv.profile.fullName}</div>
          <div style={{ fontSize: 62, lineHeight: 1.1, marginTop: 12, maxWidth: 900 }}>
            {cv.profile.headline}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 64 }}>
          {metrics.map((m) => (
            <div key={m.id} style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', fontSize: 40, color: '#FFC14D' }}>
                {m.isApproximate ? '~' : ''}
                {m.metricValue}
              </div>
              <div style={{ fontSize: 20, color: '#8A90A6' }}>{m.metricLabel}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
