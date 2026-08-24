import {
  bigint,
  boolean,
  char,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/mysql-core';

/**
 * Convenciones
 * - Charset/collation se fijan en la migración: utf8mb4 / utf8mb4_unicode_ci.
 * - El ESPAÑOL vive en estas tablas (fuente de verdad).
 * - El INGLÉS vive en `translation` como override, con respaldo en → es.
 * - Fechas de trayectoria: DATE lógico guardado como varchar 'YYYY-MM' para
 *   evitar zonas horarias en un dato que nunca necesita día.
 */

const id = () => bigint('id', { mode: 'number', unsigned: true }).autoincrement().primaryKey();
const order = () => int('order').notNull().default(0);

/* ── Contenido base ─────────────────────────────────────────────── */

export const profile = mysqlTable('profile', {
  id: id(),
  fullName: varchar('full_name', { length: 120 }).notNull(),
  headline: varchar('headline', { length: 180 }).notNull(),
  summary: text('summary').notNull(),
  summaryShort: varchar('summary_short', { length: 155 }).notNull(),
  email: varchar('email', { length: 160 }).notNull(),
  phone: varchar('phone', { length: 40 }),
  location: varchar('location', { length: 120 }).notNull(),
  availability: varchar('availability', { length: 120 }).notNull(),
  avatarUrl: varchar('avatar_url', { length: 255 }),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
});

export const variant = mysqlTable(
  'variant',
  {
    id: id(),
    slug: varchar('slug', { length: 40 }).notNull(),
    label: varchar('label', { length: 60 }).notNull(),
    headline: varchar('headline', { length: 180 }).notNull(),
    summary: text('summary').notNull(),
    pdfFileNameEs: varchar('pdf_file_name_es', { length: 120 }).notNull(),
    pdfFileNameEn: varchar('pdf_file_name_en', { length: 120 }).notNull(),
    isDefault: boolean('is_default').notNull().default(false),
    order: order(),
  },
  (t) => ({ uqSlug: uniqueIndex('uq_variant_slug').on(t.slug) }),
);

export const link = mysqlTable('link', {
  id: id(),
  label: varchar('label', { length: 60 }).notNull(),
  url: varchar('url', { length: 255 }).notNull(),
  kind: mysqlEnum('kind', ['linkedin', 'github', 'web', 'email', 'phone']).notNull(),
  order: order(),
});

export const skillGroup = mysqlTable('skill_group', {
  id: id(),
  name: varchar('name', { length: 80 }).notNull(),
  order: order(),
});

export const skill = mysqlTable(
  'skill',
  {
    id: id(),
    groupId: bigint('group_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => skillGroup.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 80 }).notNull(),
    tier: mysqlEnum('tier', ['nucleo', 'solido', 'en_uso']).notNull(),
    evidenceUrl: varchar('evidence_url', { length: 255 }),
    order: order(),
  },
  (t) => ({ ixGroup: index('ix_skill_group').on(t.groupId, t.order) }),
);

export const experience = mysqlTable(
  'experience',
  {
    id: id(),
    role: varchar('role', { length: 120 }).notNull(),
    company: varchar('company', { length: 120 }).notNull(),
    client: varchar('client', { length: 120 }),
    mode: mysqlEnum('mode', ['remoto', 'hibrido', 'presencial', 'paralelo']).notNull(),
    context: text('context').notNull(),
    startDate: char('start_date', { length: 7 }).notNull(), // YYYY-MM
    endDate: char('end_date', { length: 7 }), // null = actual
    order: order(),
  },
  (t) => ({ ixOrder: index('ix_experience_order').on(t.order) }),
);

export const achievement = mysqlTable(
  'achievement',
  {
    id: id(),
    experienceId: bigint('experience_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => experience.id, { onDelete: 'cascade' }),
    text: text('text').notNull(),
    metricLabel: varchar('metric_label', { length: 80 }),
    metricValue: varchar('metric_value', { length: 60 }),
    isApproximate: boolean('is_approximate').notNull().default(false),
    order: order(),
  },
  (t) => ({ ixExp: index('ix_achievement_exp').on(t.experienceId, t.order) }),
);

export const expTech = mysqlTable(
  'exp_tech',
  {
    id: id(),
    experienceId: bigint('experience_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => experience.id, { onDelete: 'cascade' }),
    tech: varchar('tech', { length: 60 }).notNull(),
    order: order(),
  },
  (t) => ({ ixExp: index('ix_exptech_exp').on(t.experienceId, t.order) }),
);

export const project = mysqlTable(
  'project',
  {
    id: id(),
    slug: varchar('slug', { length: 80 }).notNull(),
    title: varchar('title', { length: 160 }).notNull(),
    problem: text('problem').notNull(),
    decision: text('decision').notNull(),
    architecture: text('architecture').notNull(),
    result: text('result').notNull(),
    learning: text('learning').notNull(),
    coverUrl: varchar('cover_url', { length: 255 }),
    repoUrl: varchar('repo_url', { length: 255 }),
    liveUrl: varchar('live_url', { length: 255 }),
    isConfidential: boolean('is_confidential').notNull().default(false),
    featured: boolean('featured').notNull().default(false),
    /** Bloquea la publicación pública hasta que Sebastian revise el redactado. */
    isDraft: boolean('is_draft').notNull().default(true),
    order: order(),
  },
  (t) => ({ uqSlug: uniqueIndex('uq_project_slug').on(t.slug) }),
);

export const education = mysqlTable('education', {
  id: id(),
  institution: varchar('institution', { length: 160 }).notNull(),
  title: varchar('title', { length: 160 }).notNull(),
  level: varchar('level', { length: 60 }).notNull(),
  status: mysqlEnum('status', ['en_curso', 'culminado', 'suspendido']).notNull(),
  startDate: char('start_date', { length: 7 }).notNull(),
  endDate: char('end_date', { length: 7 }),
  order: order(),
});

export const certification = mysqlTable('certification', {
  id: id(),
  institution: varchar('institution', { length: 160 }).notNull(),
  name: varchar('name', { length: 160 }).notNull(),
  status: mysqlEnum('status', ['en_curso', 'culminado']).notNull(),
  startDate: char('start_date', { length: 7 }),
  endDate: char('end_date', { length: 7 }),
  order: order(),
});

export const language = mysqlTable('language', {
  id: id(),
  name: varchar('name', { length: 60 }).notNull(),
  level: varchar('level', { length: 20 }).notNull(),
  reading: varchar('reading', { length: 20 }).notNull(),
  writing: varchar('writing', { length: 20 }).notNull(),
  speaking: varchar('speaking', { length: 20 }).notNull(),
  order: order(),
});

/* ── Variantes de posicionamiento ───────────────────────────────── */

export const entityTypeEnum = [
  'profile',
  'variant',
  'experience',
  'achievement',
  'skill_group',
  'skill',
  'project',
  'education',
  'certification',
] as const;

export const variantRule = mysqlTable(
  'variant_rule',
  {
    id: id(),
    variantId: bigint('variant_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => variant.id, { onDelete: 'cascade' }),
    entityType: mysqlEnum('entity_type', entityTypeEnum).notNull(),
    entityId: bigint('entity_id', { mode: 'number', unsigned: true }).notNull(),
    visible: boolean('visible').notNull().default(true),
    priority: int('priority'),
  },
  (t) => ({
    uqRule: uniqueIndex('uq_variant_rule').on(t.variantId, t.entityType, t.entityId),
    ixLookup: index('ix_rule_lookup').on(t.variantId, t.entityType),
  }),
);

/* ── i18n ───────────────────────────────────────────────────────── */

export const translation = mysqlTable(
  'translation',
  {
    id: id(),
    entityType: mysqlEnum('entity_type', entityTypeEnum).notNull(),
    entityId: bigint('entity_id', { mode: 'number', unsigned: true }).notNull(),
    field: varchar('field', { length: 48 }).notNull(),
    locale: char('locale', { length: 2 }).notNull(), // 'en'
    value: text('value').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({
    uqTr: uniqueIndex('uq_translation').on(t.entityType, t.entityId, t.field, t.locale),
    ixLocale: index('ix_translation_locale').on(t.locale, t.entityType),
  }),
);

/* ── Operación ──────────────────────────────────────────────────── */

/** Sin IP, sin cookies, sin país. Solo forma agregada del tráfico. */
export const event = mysqlTable(
  'event',
  {
    id: id(),
    type: mysqlEnum('type', [
      'view',
      'pdf_download',
      'link_click',
      'project_view',
      'variant_switch',
      'locale_switch',
    ]).notNull(),
    path: varchar('path', { length: 255 }).notNull(),
    variantSlug: varchar('variant_slug', { length: 40 }),
    locale: char('locale', { length: 2 }).notNull().default('es'),
    referrer: varchar('referrer', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({ ixDay: index('ix_event_day').on(t.createdAt, t.type) }),
);

export const setting = mysqlTable(
  'setting',
  {
    id: id(),
    key: varchar('key', { length: 80 }).notNull(),
    value: json('value').notNull(),
    updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull(),
  },
  (t) => ({ uqKey: uniqueIndex('uq_setting_key').on(t.key) }),
);

export const user = mysqlTable(
  'user',
  {
    id: id(),
    email: varchar('email', { length: 160 }).notNull(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    lastLogin: timestamp('last_login'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({ uqEmail: uniqueIndex('uq_user_email').on(t.email) }),
);

export const auditLog = mysqlTable(
  'audit_log',
  {
    id: id(),
    userId: bigint('user_id', { mode: 'number', unsigned: true })
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    action: mysqlEnum('action', ['create', 'update', 'delete', 'publish', 'login']).notNull(),
    entity: varchar('entity', { length: 48 }).notNull(),
    entityId: bigint('entity_id', { mode: 'number', unsigned: true }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (t) => ({ ixUser: index('ix_audit_user').on(t.userId, t.createdAt) }),
);
