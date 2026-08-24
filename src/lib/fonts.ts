import { Archivo, JetBrains_Mono, Public_Sans } from 'next/font/google';

/**
 * Tres roles (§7). next/font descarga y auto-hospeda en el build: en runtime
 * no hay ninguna petición a Google, y el build corre en tu máquina, no en cPanel.
 *
 * display  Archivo — variable en anchura. Se usa SOLO en tamaños grandes y a
 *          wdth 120: la "geométrica ancha" del brief sin recurrir a una
 *          display de moda que envejezca en un año.
 * cuerpo   Public Sans — alta legibilidad, pensada para texto denso.
 * utilidad JetBrains Mono — etiquetas, fechas y cifras. Es la voz de la
 *          consola, así que la tipografía del terminal es la del terminal.
 */

export const display = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  weight: 'variable',
  variable: '--font-display',
  display: 'swap',
});

export const body = Public_Sans({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
});

export const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
});
