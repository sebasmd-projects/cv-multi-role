'use client';

import { useState, useTransition } from 'react';
import { saveProfile, type ActionResult } from '@/lib/actions';
import { FieldList, Status, inputClass, type Field } from '../_components/bilingual';

type Profile = {
  id: number;
  fullName: string;
  headline: string;
  summary: string;
  summaryShort: string;
  email: string;
  phone: string | null;
  location: string;
  availability: string;
};

export function ProfileEditor({ profile, fields }: { profile: Profile; fields: Field[] }) {
  const [base, setBase] = useState(profile);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const short = base.summaryShort.length;

  return (
    <div className="space-y-10">
      <section>
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ['fullName', 'Nombre'],
              ['email', 'Correo'],
              ['phone', 'Teléfono'],
              ['location', 'Ubicación'],
              ['availability', 'Disponibilidad'],
              ['headline', 'Titular'],
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

          <label className="block md:col-span-2">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Resumen</span>
            <textarea rows={6} value={base.summary} onChange={(e) => setBase({ ...base, summary: e.target.value })} className={inputClass} />
          </label>

          <label className="block md:col-span-2">
            <span className="mb-1 flex justify-between font-mono text-[0.7rem] text-[var(--muted)]">
              <span>Meta description</span>
              <span className={`tabular ${short > 155 ? 'text-[var(--pulse)]' : short > 145 ? 'text-[var(--phosphor)]' : ''}`}>
                {short}/155
              </span>
            </span>
            <textarea rows={2} value={base.summaryShort} onChange={(e) => setBase({ ...base, summaryShort: e.target.value })} className={inputClass} />
            <span className="mt-1 block text-[0.7rem] text-[var(--muted)]">
              Pasados los 155 caracteres, el buscador la recorta a mitad de frase.
            </span>
          </label>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            disabled={pending}
            onClick={() => start(async () => setResult(await saveProfile(base)))}
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
