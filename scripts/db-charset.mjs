import mysql from 'mysql2/promise';

/**
 * Pasa la base y todas sus tablas a utf8mb4.
 *
 * cPanel crea las bases en latin1_swedish_ci. Ahí caben las tildes, así que el
 * problema no salta a la vista: lo que se pierde son los caracteres que latin1
 * no tiene — «→» se guarda como «?», y no hay vuelta atrás salvo re-sembrar.
 *
 *   node --env-file=.env scripts/db-charset.mjs
 *   npm run db:seed        # obligatorio después: recupera lo ya truncado
 */

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = process.env;

if (!DB_NAME) {
  console.error('Falta DB_NAME. Ejecuta con: node --env-file=.env scripts/db-charset.mjs');
  process.exit(1);
}

const conn = await mysql.createConnection({
  host: DB_HOST,
  port: Number(DB_PORT ?? 3306),
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  charset: 'utf8mb4',
});

await conn.query(`ALTER DATABASE \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
console.log(`✔ base ${DB_NAME} → utf8mb4`);

const [tables] = await conn.query('SHOW TABLES');

for (const row of tables) {
  const table = Object.values(row)[0];
  await conn.query(
    `ALTER TABLE \`${table}\` CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  console.log(`  ✔ ${table}`);
}

const [[check]] = await conn.query(
  `SELECT COUNT(*) AS latin
     FROM information_schema.columns
    WHERE table_schema = ? AND character_set_name IS NOT NULL AND character_set_name <> 'utf8mb4'`,
  [DB_NAME],
);

await conn.end();

console.log(
  check.latin === 0
    ? '\n✔ Ninguna columna fuera de utf8mb4. Ahora: npm run db:seed'
    : `\n✖ Quedan ${check.latin} columnas fuera de utf8mb4.`,
);
