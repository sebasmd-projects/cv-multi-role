'use client';

import { useState, useTransition } from 'react';
import { saveAiCrawlers, type ActionResult } from '@/lib/actions';
import { Status } from '../_components/bilingual';

type Policy = 'allow' | 'disallow';

const NOTES: Record<string, string> = {
  GPTBot: 'ChatGPT',
  ClaudeBot: 'Claude',
  PerplexityBot: 'Perplexity',
  'Google-Extended': 'Gemini y AI Overviews',
  CCBot: 'Common Crawl — alimenta a muchos modelos',
  Bytespider: 'ByteDance',
};

export function CrawlerPolicies({ initial }: { initial: Record<string, Policy> }) {
  const [policies, setPolicies] = useState(initial);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <section>
      <ul className="max-w-2xl divide-y divide-[var(--line)]">
        {Object.entries(policies).map(([bot, policy]) => (
          <li key={bot} className="flex items-center justify-between gap-4 py-3">
            <div>
              <span className="font-mono text-[var(--step--1)]">{bot}</span>
              <span className="ml-3 text-[var(--step--1)] text-[var(--muted)]">{NOTES[bot]}</span>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3">
              <span className="text-[var(--step--1)] text-[var(--muted)]">
                {policy === 'allow' ? 'Permitido' : 'Bloqueado'}
              </span>
              <input
                type="checkbox"
                checked={policy === 'allow'}
                onChange={(e) => setPolicies({ ...policies, [bot]: e.target.checked ? 'allow' : 'disallow' })}
                className="size-4 accent-[var(--phosphor)]"
              />
              <span className="sr-only">Permitir a {bot} rastrear el sitio</span>
            </label>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex items-center gap-4">
        <button
          disabled={pending}
          onClick={() => start(async () => setResult(await saveAiCrawlers(policies)))}
          className="rounded bg-[var(--phosphor)] px-4 py-2 text-[var(--step--1)] font-medium text-[var(--void)] disabled:opacity-60"
        >
          {pending ? 'Guardando…' : 'Guardar políticas'}
        </button>
        <Status result={result} />
      </div>
    </section>
  );
}
