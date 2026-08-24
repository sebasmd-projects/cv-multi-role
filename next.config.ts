import type { NextConfig } from 'next';

const config: NextConfig = {
  // Passenger arranca un único proceso Node: standalone empaqueta solo lo
  // necesario y evita depender de node_modules en el servidor.
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,

  typescript: { ignoreBuildErrors: false },

  images: {
    formats: ['image/avif', 'image/webp'],
    // cPanel no tiene el optimizador de Next detrás de un CDN: las imágenes
    // se sirven ya optimizadas desde /public/uploads.
    unoptimized: true,
  },

  experimental: {
    // Presupuesto §11: JS de cliente en / por debajo de 120 KB gzip,
    // sin contar la pieza 3D diferida (techo aprobado: 200 KB).
    optimizePackageImports: ['@react-three/fiber', 'three'],
  },

  serverExternalPackages: ['mysql2', 'bcryptjs', '@react-pdf/renderer'],
};

export default config;
