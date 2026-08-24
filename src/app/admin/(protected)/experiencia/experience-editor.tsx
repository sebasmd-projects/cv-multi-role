'use client';

import { useState, useTransition } from 'react';
import { saveAchievement, saveExperience, type ActionResult } from '@/lib/actions';
import { FieldList, Status, inputClass, type Field } from '../_components/bilingual';

type Experience = {
  id: number;
  role: string;
  company: string;
  client: string | null;
  mode: 'remoto' | 'hibrido' | 'presencial' | 'paralelo';
  context: string;
  startDate: string;
  endDate: string | null;
};

type Achievement = {
  id: number;
  text: string;
  metricLabel: string | null;
  metricValue: string | null;
  isApproximate: boolean;
};

function AchievementRow({ achievement }: { achievement: Achievement }) {
  const [a, setA] = useState(achievement);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <li className="border-b border-[var(--line)] py-4">
      <textarea
        rows={2}
        value={a.text}
        onChange={(e) => setA({ ...a, text: e.target.value })}
        aria-label="Texto del logro"
        className={inputClass}
      />

      <div className="mt-2 grid gap-2 sm:grid-cols-[1fr_10rem_auto_auto]">
        <input
          value={a.metricLabel ?? ''}
          onChange={(e) => setA({ ...a, metricLabel: e.target.value })}
          placeholder="Etiqueta de la métrica"
          aria-label="Etiqueta de la métrica"
          className={inputClass}
        />
        <input
          value={a.metricValue ?? ''}
          onChange={(e) => setA({ ...a, metricValue: e.target.value })}
          placeholder="32 · 12 h → 1 h"
          aria-label="Valor de la métrica"
          className={`${inputClass} tabular`}
        />
        <label className="inline-flex items-center gap-2 px-1">
          <input
            type="checkbox"
            checked={a.isApproximate}
            onChange={(e) => setA({ ...a, isApproximate: e.target.checked })}
            className="size-4 accent-[var(--phosphor)]"
          />
          {/* Una estimación marcada es honesta; una estimación presentada como
              dato exacto se cae en la primera repregunta de una entrevista. */}
          <span className="text-[var(--step--1)] text-[var(--muted)]">Estimado</span>
        </label>
        <button
          disabled={pending}
          onClick={() => start(async () => setResult(await saveAchievement(a)))}
          className="rounded border border-[var(--line)] px-3 py-2 text-[var(--step--1)] text-[var(--muted)] hover:border-[var(--phosphor)] hover:text-[var(--phosphor)] disabled:opacity-60"
        >
          Guardar
        </button>
      </div>

      <div className="mt-1 min-h-5">
        <Status result={result} />
      </div>
    </li>
  );
}

export function ExperienceEditor({
  experience,
  achievements,
  fields,
}: {
  experience: Experience;
  achievements: Achievement[];
  fields: Field[];
}) {
  const [base, setBase] = useState(experience);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-10">
      <section>
        <h2 className="mb-4 text-[var(--step-1)]">
          Puesto <span className="font-mono text-[var(--step--1)] text-[var(--muted)]">· español</span>
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ['role', 'Cargo'],
              ['company', 'Empresa'],
              ['client', 'Cliente'],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">{label}</span>
              <input
                value={base[key] ?? ''}
                onChange={(e) => setBase({ ...base, [key]: e.target.value })}
                className={inputClass}
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Modalidad</span>
            <select
              value={base.mode}
              onChange={(e) => setBase({ ...base, mode: e.target.value as Experience['mode'] })}
              className={inputClass}
            >
              <option value="remoto">Remoto</option>
              <option value="hibrido">Híbrido</option>
              <option value="presencial">Presencial</option>
              <option value="paralelo">Paralelo</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Inicio · AAAA-MM</span>
            <input
              value={base.startDate}
              onChange={(e) => setBase({ ...base, startDate: e.target.value })}
              placeholder="2024-09"
              className={`${inputClass} tabular`}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Fin · vacío = actual</span>
            <input
              value={base.endDate ?? ''}
              onChange={(e) => setBase({ ...base, endDate: e.target.value })}
              placeholder="2026-03"
              className={`${inputClass} tabular`}
            />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Contexto</span>
            <textarea
              rows={3}
              value={base.context}
              onChange={(e) => setBase({ ...base, context: e.target.value })}
              className={inputClass}
            />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            disabled={pending}
            onClick={() => start(async () => setResult(await saveExperience(base)))}
            className="rounded bg-[var(--phosphor)] px-4 py-2 text-[var(--step--1)] font-medium text-[var(--void)] disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Status result={result} />
        </div>
      </section>

      <section>
        <h2 className="text-[var(--step-1)]">Logros</h2>
        <p className="mt-1 text-[var(--step--1)] text-[var(--muted)]">
          Los que tienen métrica salen también en la consola del hero y en el PDF.
        </p>
        <ul className="mt-4">
          {achievements.map((a) => (
            <AchievementRow key={a.id} achievement={a} />
          ))}
        </ul>
      </section>

      <FieldList fields={fields} title="Traducción" />
    </div>
  );
}
