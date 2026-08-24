import { eq } from 'drizzle-orm';
import { db, schema } from '@/db/client';
import { ProfileEditor } from './profile-editor';

export const dynamic = 'force-dynamic';

export default async function PerfilPage() {
  const [[profile], translations] = await Promise.all([
    db.select().from(schema.profile).limit(1),
    db.select().from(schema.translation).where(eq(schema.translation.locale, 'en')),
  ]);

  if (!profile) return <p className="text-[var(--muted)]">No hay perfil. Ejecuta el seed.</p>;

  const en = new Map(translations.map((t) => [`${t.entityType}:${t.entityId}:${t.field}`, t.value]));

  const fields = (
    [
      ['headline', 'Titular', false, 180],
      ['subtitle', 'Subtítulo', false, 180],
      ['summary', 'Resumen', true, undefined],
      ['summaryShort', 'Meta description', true, 155],
      ['location', 'Ubicación', false, 120],
      ['availability', 'Disponibilidad', false, 120],
    ] as const
  ).map(([field, label, multiline, maxLength]) => ({
    entityType: 'profile',
    entityId: profile.id,
    field,
    label,
    // `subtitle` solo existe como traducción: no tiene columna propia.
    es: field === 'subtitle' ? '' : (profile[field as keyof typeof profile] as string),
    en: en.get(`profile:${profile.id}:${field}`) ?? '',
    multiline,
    maxLength,
  }));

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[var(--step-3)] leading-tight">Perfil</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          El titular y el resumen que se ven en el sitio los manda la variante activa. Lo de aquí es el respaldo y
          lo que va en los metadatos.
        </p>
      </header>

      <ProfileEditor profile={profile} fields={fields} />
    </>
  );
}
