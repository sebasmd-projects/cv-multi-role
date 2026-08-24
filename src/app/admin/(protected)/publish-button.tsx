'use client';

import { useState, useTransition } from 'react';
import { publish, type ActionResult } from '@/lib/actions';

export function PublishButton() {
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <span role="status" aria-live="polite" className="text-[var(--step--1)] text-[var(--muted)]">
        {result?.message}
      </span>
      <button
        disabled={pending}
        onClick={() => start(async () => setResult(await publish()))}
        className="rounded bg-[var(--phosphor)] px-4 py-2 text-[var(--step--1)] font-medium text-[var(--void)] disabled:opacity-60"
      >
        {pending ? 'Publicando…' : 'Publicar'}
      </button>
    </div>
  );
}
