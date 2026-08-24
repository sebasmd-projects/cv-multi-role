'use client';

import { useState, useTransition } from 'react';
import { saveTranslation, type ActionResult } from '@/lib/actions';

/**
 * Piezas compartidas por todas las pantallas del panel.
 *
 * Estaban dentro de `variantes/variant-editor.tsx`; al aparecer la cuarta
 * pantalla que necesitaba lo mismo, se extrajeron aquí en vez de copiarlas.
 */

export type Field = {
  entityType: string;
  entityId: number;
  field: string;
  label: string;
  es: string;
  en: string;
  multiline?: boolean;
  maxLength?: number;
};

export const inputClass =
  'w-full rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[var(--step--1)] text-[var(--text)] placeholder:text-[var(--muted)]';

export function Status({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return (
    <span
      role="status"
      aria-live="polite"
      className={`text-[var(--step--1)] ${result.ok ? 'text-[var(--signal)]' : 'text-[var(--pulse)]'}`}
    >
      {result.message}
    </span>
  );
}

export function BilingualField({ field }: { field: Field }) {
  const [en, setEn] = useState(field.en);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const dirty = en !== field.en;
  const Input = field.multiline ? 'textarea' : 'input';
  const id = `${field.entityType}-${field.entityId}-${field.field}`;

  function save() {
    if (!dirty) return;
    start(async () => {
      setResult(
        await saveTranslation({
          entityType: field.entityType,
          entityId: field.entityId,
          field: field.field,
          value: en,
        }),
      );
    });
  }

  return (
    <div className="grid gap-2 border-b border-[var(--line)] py-4 md:grid-cols-[10rem_1fr_1fr] md:gap-4">
      <label htmlFor={id} className="pt-2 font-mono text-[var(--step--1)] text-[var(--muted)]">
        {field.label}
      </label>

      <div>
        <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">ES · fuente</span>
        <p className={`${inputClass} whitespace-pre-wrap opacity-70`}>{field.es}</p>
      </div>

      <div>
        <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">EN</span>
        <Input
          id={id}
          value={en}
          rows={field.multiline ? 5 : undefined}
          maxLength={field.maxLength}
          disabled={pending}
          onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setEn(e.target.value)}
          onBlur={save}
          placeholder="Vacío: este campo mostrará el español"
          className={`${inputClass} ${dirty ? 'border-[var(--phosphor)]' : ''}`}
        />
        <div className="mt-1 flex min-h-5 items-center justify-between gap-3">
          <Status result={result} />
          {field.maxLength ? (
            <span
              className={`tabular font-mono text-[0.7rem] ${
                en.length > field.maxLength - 10 ? 'text-[var(--pulse)]' : 'text-[var(--muted)]'
              }`}
            >
              {en.length}/{field.maxLength}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/** Lista de campos con su cabecera. Se guarda campo a campo, al perder el foco. */
export function FieldList({ fields, title }: { fields: Field[]; title?: string }) {
  return (
    <section>
      {title ? <h2 className="mb-1 text-[var(--step-1)]">{title}</h2> : null}
      <p className="mb-2 text-[var(--step--1)] text-[var(--muted)]">
        Se guarda al salir de cada campo. Vaciar un campo borra la traducción y devuelve el español.
      </p>
      <div>
        {fields.map((f) => (
          <BilingualField key={`${f.entityType}-${f.entityId}-${f.field}`} field={f} />
        ))}
      </div>
    </section>
  );
}
