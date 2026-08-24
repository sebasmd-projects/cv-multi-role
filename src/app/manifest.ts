import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Sebastian Morales — CV',
    short_name: 'SM · CV',
    description: 'Ingeniero de automatización y transformación digital.',
    start_url: '/',
    display: 'browser',
    background_color: '#0A0B10',
    theme_color: '#0A0B10',
    lang: 'es',
  };
}
