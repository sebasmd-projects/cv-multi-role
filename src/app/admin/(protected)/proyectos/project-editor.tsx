'use client';

import { useState, useTransition } from 'react';
import { approveProject, saveProject, unapproveProject, type ActionResult } from '@/lib/actions';
import { FieldList, Status, inputClass, type Field } from '../_components/bilingual';

type Project = {
  id: number;
  slug: string;
  title: string;
  problem: string;
  decision: string;
  architecture: string;
  result: string;
  learning: string;
  repoUrl: string | null;
  liveUrl: string | null;
  isConfidential: boolean;
  featured: boolean;
  isDraft: boolean;
};

export function ProjectEditor({ project, fields }: { project: Project; fields: Field[] }) {
  const [base, setBase] = useState(project);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [draft, setDraft] = useState(project.isDraft);
  const [pending, start] = useTransition();

  const areas = [
    ['problem', 'Problema'],
    ['decision', 'Decisión'],
    ['architecture', 'Arquitectura'],
    ['result', 'Resultado'],
    ['learning', 'Aprendizaje'],
  ] as const;

  return (
    <div className="space-y-10">
      {draft ? (
        <div className="rounded border border-[var(--pulse)] bg-[var(--surface)] p-5">
          <h2 className="text-[var(--step-1)]">En borrador</h2>
          <p className="mt-2 max-w-2xl text-[var(--step--1)] text-[var(--muted)]">
            Este texto está redactado a partir de tus datos, pero es interpretación: tendrás que sostenerlo en
            entrevista. Léelo entero antes de aprobarlo.
          </p>
          <button
            disabled={pending}
            onClick={() => start(async () => { setResult(await approveProject({ id: base.id })); setDraft(false); })}
            className="mt-4 rounded bg-[var(--phosphor)] px-4 py-2 text-[var(--step--1)] font-medium text-[var(--void)] disabled:opacity-60"
          >
            Aprobar y publicar
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <span className="font-mono text-[var(--step--1)] text-[var(--signal)]">Publicado</span>
          <button
            disabled={pending}
            onClick={() => start(async () => { setResult(await unapproveProject({ id: base.id })); setDraft(true); })}
            className="text-[var(--step--1)] text-[var(--muted)] hover:text-[var(--pulse)]"
          >
            Volver a borrador
          </button>
        </div>
      )}

      <section>
        <h2 className="mb-1 text-[var(--step-1)]">
          Contenido base <span className="font-mono text-[var(--step--1)] text-[var(--muted)]">· español</span>
        </h2>

        <div className="mt-4 space-y-4">
          <label className="block">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Título</span>
            <input value={base.title} onChange={(e) => setBase({ ...base, title: e.target.value })} className={inputClass} />
          </label>

          {areas.map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">{label}</span>
              <textarea
                rows={4}
                value={base[key]}
                onChange={(e) => setBase({ ...base, [key]: e.target.value })}
                className={inputClass}
              />
            </label>
          ))}

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Repositorio</span>
              <input value={base.repoUrl ?? ''} onChange={(e) => setBase({ ...base, repoUrl: e.target.value })} className={inputClass} placeholder="https://…" />
            </label>
            <label className="block">
              <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Sitio en vivo</span>
              <input value={base.liveUrl ?? ''} onChange={(e) => setBase({ ...base, liveUrl: e.target.value })} className={inputClass} placeholder="https://…" />
            </label>
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={base.isConfidential}
                onChange={(e) => setBase({ ...base, isConfidential: e.target.checked })}
                className="size-4 accent-[var(--phosphor)]"
              />
              <span className="text-[var(--step--1)]">Proyecto de cliente (se muestra sin datos identificables)</span>
            </label>
            <label className="inline-flex items-center gap-2">
              <input
                type="checkbox"
                checked={base.featured}
                onChange={(e) => setBase({ ...base, featured: e.target.checked })}
                className="size-4 accent-[var(--phosphor)]"
              />
              <span className="text-[var(--step--1)]">Destacado</span>
            </label>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            disabled={pending}
            onClick={() => start(async () => setResult(await saveProject(base)))}
            className="rounded bg-[var(--phosphor)] px-4 py-2 text-[var(--step--1)] font-medium text-[var(--void)] disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Status result={result} />
        </div>
      </section>

      <FieldList fields={fields} title="Traducción" />
    </div>
  );
}
