'use client';

import { useState, useTransition } from 'react';
import { saveSkillTier, type ActionResult } from '@/lib/actions';
import { Status, inputClass } from '../_components/bilingual';

type Skill = { id: number; name: string; tier: 'nucleo' | 'solido' | 'en_uso'; evidenceUrl: string | null };

export function SkillEditor({ skill }: { skill: Skill }) {
  const [s, setS] = useState(skill);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const commit = (next: Skill) =>
    start(async () => setResult(await saveSkillTier({ id: next.id, tier: next.tier, evidenceUrl: next.evidenceUrl })));

  return (
    <li className="grid items-center gap-3 py-3 sm:grid-cols-[1fr_9rem_1fr_auto]">
      <span className="text-[var(--step--1)]">{s.name}</span>

      <select
        value={s.tier}
        disabled={pending}
        aria-label={`Nivel de ${s.name}`}
        onChange={(e) => {
          const next = { ...s, tier: e.target.value as Skill['tier'] };
          setS(next);
          commit(next);
        }}
        className={inputClass}
      >
        <option value="nucleo">núcleo</option>
        <option value="solido">sólido</option>
        <option value="en_uso">en uso</option>
      </select>

      <input
        value={s.evidenceUrl ?? ''}
        disabled={pending}
        placeholder="Evidencia: repo, caso, certificación"
        aria-label={`Evidencia de ${s.name}`}
        onChange={(e) => setS({ ...s, evidenceUrl: e.target.value })}
        onBlur={() => commit(s)}
        className={inputClass}
      />

      <div className="min-h-5">
        <Status result={result} />
      </div>
    </li>
  );
}
