import { asc } from 'drizzle-orm';
import { db, schema } from '@/db/client';
import { SkillEditor } from './skill-editor';

export const dynamic = 'force-dynamic';

export default async function HabilidadesPage() {
  const [groups, skills] = await Promise.all([
    db.select().from(schema.skillGroup).orderBy(asc(schema.skillGroup.order)),
    db.select().from(schema.skill).orderBy(asc(schema.skill.order)),
  ]);

  return (
    <>
      <header className="mb-8">
        <h1 className="text-[var(--step-3)] leading-tight">Habilidades</h1>
        <p className="mt-2 max-w-2xl text-[var(--muted)]">
          Tres estados, nunca porcentajes: <strong className="text-[var(--text)]">núcleo</strong> es lo que
          defiendes en una entrevista técnica sin preparar, <strong className="text-[var(--text)]">sólido</strong> lo
          que has usado en producción, <strong className="text-[var(--text)]">en uso</strong> lo que estás
          aprendiendo. El enlace de evidencia es opcional y solo donde exista.
        </p>
      </header>

      <div className="space-y-10">
        {groups.map((g) => (
          <section key={g.id}>
            <h2 className="mb-3 text-[var(--step-1)]">{g.name}</h2>
            <ul className="divide-y divide-[var(--line)]">
              {skills
                .filter((s) => s.groupId === g.id)
                .map((s) => (
                  <SkillEditor key={s.id} skill={s} />
                ))}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
