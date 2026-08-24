#!/usr/bin/env node
/**
 * FASE 0 — Verificación en el hosting real, antes de escribir una línea de UI.
 *
 * Ejecutar EN EL SERVIDOR, desde el terminal de cPanel:
 *   cd ~/cv-multi-rol && node scripts/spike.mjs
 *
 * Cada fallo aquí cuesta una tarde. El mismo fallo descubierto en la fase 7
 * cuesta un rediseño.
 */

import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const results = [];
const check = (name, fn) =>
  Promise.resolve()
    .then(fn)
    .then((detail) => results.push({ ok: true, name, detail }))
    .catch((e) => results.push({ ok: false, name, detail: e.message }));

/* 1. Node — el build de Next 16 exige >= 20.9; el hosting reporta 22.23.2 */
await check('Node >= 22', () => {
  const [major] = process.versions.node.split('.').map(Number);
  if (major < 22) throw new Error(`Node ${process.versions.node} — se requiere 22.x`);
  return `v${process.versions.node}`;
});

/* 2. Passenger — confirma que el proceso arranca bajo Passenger y no suelto */
await check('Entorno Passenger', () => {
  const port = process.env.PORT || process.env.SERVER_PORT;
  const passenger = process.env.PASSENGER_APP_ENV || process.env.PASSENGER_BASE_URI;
  if (!port && !passenger) {
    throw new Error('Sin PORT ni variables PASSENGER — ¿se ejecuta fuera de la app Node?');
  }
  return `PORT=${port ?? 'n/d'} PASSENGER_APP_ENV=${passenger ?? 'n/d'}`;
});

/* 3. MariaDB — conexión, versión y collation. utf8mb4 no es negociable:
      con latin1 los acentos y las flechas → del CV se corrompen en silencio. */
await check('MariaDB + utf8mb4', async () => {
  const mysql = require('mysql2/promise');
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT ?? 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  const [[v]] = await conn.query('SELECT VERSION() AS v');
  const [[c]] = await conn.query(
    `SELECT DEFAULT_CHARACTER_SET_NAME cs, DEFAULT_COLLATION_NAME co
       FROM information_schema.SCHEMATA WHERE SCHEMA_NAME = ?`,
    [process.env.DB_NAME],
  );
  await conn.query('SELECT ? AS probe', ['áéíóúñ → 60% → 85%']);
  await conn.end();
  if (c.cs !== 'utf8mb4') throw new Error(`charset ${c.cs}, se requiere utf8mb4`);
  return `${v.v} · ${c.cs}/${c.co}`;
});

/* 4. Escritura en disco — uploads y caché de PDF. Sin esto, ni imágenes ni
      PDF cacheado; y el error solo aparecería en producción. */
for (const [label, dir] of [
  ['Uploads escribible', process.env.UPLOADS_DIR],
  ['Caché PDF escribible', process.env.PDF_CACHE_DIR],
]) {
  await check(label, () => {
    if (!dir) throw new Error('variable de entorno sin definir');
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
    const probe = join(dir, `.probe-${Date.now()}`);
    writeFileSync(probe, 'ok');
    unlinkSync(probe);
    return dir;
  });
}

/* 5. @react-pdf/renderer — la apuesta grande del brief. Necesita fontkit y
      canvas-free rendering; si tirara de binarios nativos, se sabe HOY. */
await check('@react-pdf/renderer en memoria', async () => {
  const { renderToBuffer, Document, Page, Text, StyleSheet } = require('@react-pdf/renderer');
  const React = require('react');
  const s = StyleSheet.create({ p: { padding: 24, fontSize: 12 } });
  const doc = React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: s.p },
      React.createElement(Text, null, 'Sebastian Morales — prueba de render · áéíóúñ'),
    ),
  );
  const buf = await renderToBuffer(doc);
  if (!buf || buf.length < 500) throw new Error('PDF vacío o truncado');
  return `${(buf.length / 1024).toFixed(1)} KB generados`;
});

/* 6. Memoria — Passenger en compartido suele topar en 512 MB - 1 GB.
      El render de PDF y el build son los dos picos. */
await check('Memoria disponible', () => {
  const limit = process.env.PASSENGER_MAX_POOL_SIZE;
  const heap = (process.memoryUsage().rss / 1024 / 1024).toFixed(0);
  return `RSS actual ${heap} MB · pool=${limit ?? 'n/d'}`;
});

/* ── Informe ──────────────────────────────────────────────────── */
console.log('\nFASE 0 — verificación en hosting\n' + '─'.repeat(52));
for (const r of results) {
  console.log(`${r.ok ? '✔' : '✖'}  ${r.name.padEnd(30)} ${r.detail}`);
}
const failed = results.filter((r) => !r.ok);
console.log('─'.repeat(52));
if (failed.length) {
  console.log(`\n${failed.length} verificación(es) fallida(s). No avanzar a fase 1.`);
  process.exit(1);
}
console.log('\nTodo verde. Vía libre para migraciones y seed.\n');
