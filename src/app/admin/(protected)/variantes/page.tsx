import Link from 'next/link';
import { asc, eq } from 'drizzle-orm';
import { db, schema } from '@/db/client';
import { VariantEditor } from './variant-editor';

export const dynamic = 'force-dynamic';

/**
 * Server Component: arma los datos, el cliente solo edita.
 * El selector de variante es navegación real (?v=slug), no estado local:
 * así la URL del panel es compartible y el botón atrás funciona.
 */
export default async function VariantesPage({
  searchParams,
}: {
  searchParams: Promise<{ v?: string }>;
}) {
  const { v } = await searchParams;

  const [variants, experiences, groups, projects, translations] = await Promise.all([
    db.select().from(schema.variant).orderBy(asc(schema.variant.order)),
    db.select().from(schema.experience).orderBy(asc(schema.experience.order)),
    db.select().from(schema.skillGroup).orderBy(asc(schema.skillGroup.order)),
    db.select().from(schema.project).orderBy(asc(schema.project.order)),
    db.select().from(schema.translation).where(eq(schema.translation.locale, 'en')),
  ]);

  const active = variants.find((x) => x.slug === v) ?? variants.find((x) => x.isDefault) ?? variants[0];
  if (!active) {
    return (
      <p className="text-[var(--muted)]">
        No hay variantes en la base de datos. Ejecuta <code className="text-[var(--phosphor)]">npm run db:seed</code>.
      </p>
    );
  }

  const rules = await db
    .select()
    .from(schema.variantRule)
    .where(eq(schema.variantRule.variantId, active.id));

  const en = new Map(translations.map((t) => [`${t.entityType}:${t.entityId}:${t.field}`, t.value]));
  const get = (type: string, id: number, field: string) => en.get(`${type}:${id}:${field}`) ?? '';

  const fields = [
    { field: 'label', label: 'Etiqueta', es: active.label, maxLength: 60 },
    { field: 'headline', label: 'Titular', es: active.headline, maxLength: 180 },
    { field: 'summary', label: 'Resumen', es: active.summary, multiline: true },
  ].map((f) => ({
    ...f,
    entityType: 'variant',
    entityId: active.id,
    en: get('variant', active.id, f.field),
  }));

  const rule = (type: string, id: number) => rules.find((r) => r.entityType === type && r.entityId === id);

  const blocks = [
    ...experiences.map((e) => ({
      entityType: 'experience',
      entityId: e.id,
      label: `${e.company}${e.client ? ` · ${e.client}` : ''}`,
      note: undefined as string | undefined,
    })),
    ...groups.map((g) => ({
      entityType: 'skill_group',
      entityId: g.id,
      label: `Habilidades · ${g.name}`,
      note: undefined as string | undefined,
    })),
    ...projects.map((p) => ({
      entityType: 'project',
      entityId: p.id,
      label: p.title,
      note: p.isDraft ? 'borrador' : undefined,
    })),
  ].map((b) => {
    const r = rule(b.entityType, b.entityId);
    return { ...b, visible: r?.visible ?? true, priority: r?.priority ?? null, hasRule: !!r };
  });

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[var(--step-3)] leading-tight">Variantes</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          El mismo contenido, servido según a quién se postula. Cada variante genera su propio PDF en los dos idiomas.
        </p>

        <nav aria-label="Variante activa" className="mt-6 flex flex-wrap gap-2">
          {variants.map((x) => {
            const on = x.id === active.id;
            return (
              <Link
                key={x.slug}
                href={`/admin/variantes?v=${x.slug}`}
                aria-current={on ? 'page' : undefined}
                className={`rounded border px-3 py-2 font-mono text-[var(--step--1)] transition-colors ${
                  on
                    ? 'border-[var(--phosphor)] text-[var(--phosphor)]'
                    : 'border-[var(--line)] text-[var(--muted)] hover:text-[var(--text)]'
                }`}
              >
                {x.slug}
                {x.isDefault ? <span className="ml-2 text-[0.7rem] text-[var(--muted)]">defecto</span> : null}
              </Link>
            );
          })}
        </nav>
      </header>

      <VariantEditor variant={active} fields={fields} blocks={blocks} />
    </>
  );
}
