'use client';

import { useEffect } from 'react';

/**
 * Marca el documento como ya arrancado.
 *
 * El tecleo —de la consola y de la firma— es un gesto de carga, no de
 * navegación: cambiar de variante no debe repetirlo. Como esas navegaciones
 * son de cliente, el documento sobrevive, y basta una marca en `<html>` que
 * globals.css consulta para apagar ambas animaciones.
 *
 * El plazo cubre la más larga de las dos, la firma: ~21 caracteres a 60 ms
 * cada uno (ver `.typed` en globals.css).
 */
const BOOT_MS = 1600;

export function BootMark() {
  useEffect(() => {
    if (document.documentElement.dataset.booted) return;
    const id = window.setTimeout(() => {
      document.documentElement.dataset.booted = '1';
    }, BOOT_MS);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
