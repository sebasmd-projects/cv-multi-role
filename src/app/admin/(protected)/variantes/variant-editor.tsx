'use client';

import { useState, useTransition } from 'react';
import { saveVariant, saveVariantRule, resetVariantRule, type ActionResult } from '@/lib/actions';
import { FieldList, Status, inputClass, type Field } from '../_components/bilingual';

/**
 * Editor lado a lado ES | EN.
 *
 * El español es la fuente de verdad; el inglés es un override. Vaciar el campo
 * inglés borra el override y el campo vuelve a mostrar el español — por eso el
 * estado vacío dice qué pasará, en vez de limitarse a estar vacío.
 *
 * Guardado por campo al perder el foco: un formulario único obligaría a
 * recordar qué se tocó, y aquí hay decenas de campos en dos idiomas.
 */

type Block = {
  entityType: string;
  entityId: number;
  label: string;
  note?: string;
  visible: boolean;
  priority: number | null;
  hasRule: boolean;
};

function BlockRow({ block, variantId }: { block: Block; variantId: number }) {
  const [visible, setVisible] = useState(block.visible);
  const [priority, setPriority] = useState<string>(block.priority?.toString() ?? '');
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  const commit = (nextVisible: boolean, nextPriority: string) =>
    start(async () => {
      setResult(
        await saveVariantRule({
          variantId,
          entityType: block.entityType,
          entityId: block.entityId,
          visible: nextVisible,
          priority: nextPriority === '' ? null : Number(nextPriority),
        }),
      );
    });

  return (
    <tr className="border-b border-[var(--line)]">
      <td className="py-3 pr-4">
        <span className="text-[var(--step--1)]">{block.label}</span>
        {block.note ? (
          <span className="ml-2 font-mono text-[0.7rem] text-[var(--pulse)]">{block.note}</span>
        ) : null}
      </td>
      <td className="py-3 pr-4">
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            checked={visible}
            disabled={pending}
            onChange={(e) => {
              setVisible(e.target.checked);
              commit(e.target.checked, priority);
            }}
            className="size-4 accent-[var(--phosphor)]"
          />
          <span className="sr-only">Mostrar «{block.label}» en esta variante</span>
        </label>
      </td>
      <td className="py-3 pr-4">
        <input
          type="number"
          min={0}
          max={999}
          value={priority}
          disabled={pending || !visible}
          onChange={(e) => setPriority(e.target.value)}
          onBlur={() => commit(visible, priority)}
          placeholder="—"
          aria-label={`Prioridad de ${block.label}`}
          className="tabular w-16 rounded border border-[var(--line)] bg-[var(--surface)] px-2 py-1 text-[var(--step--1)]"
        />
      </td>
      <td className="py-3">
        {block.hasRule ? (
          <button
            disabled={pending}
            onClick={() =>
              start(async () =>
                setResult(
                  await resetVariantRule({
                    variantId,
                    entityType: block.entityType,
                    entityId: block.entityId,
                  }),
                ),
              )
            }
            className="text-[var(--step--1)] text-[var(--muted)] hover:text-[var(--phosphor)]"
          >
            Restablecer
          </button>
        ) : (
          <span className="font-mono text-[0.7rem] text-[var(--muted)]">por defecto</span>
        )}
        <div className="mt-1">
          <Status result={result} />
        </div>
      </td>
    </tr>
  );
}

export function VariantEditor({
  variant,
  fields,
  blocks,
}: {
  variant: { id: number; slug: string; label: string; headline: string; summary: string; pdfFileNameEs: string; pdfFileNameEn: string };
  fields: Field[];
  blocks: Block[];
}) {
  const [base, setBase] = useState(variant);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, start] = useTransition();

  return (
    <div className="space-y-10">
      <section aria-labelledby="base-es">
        <h2 id="base-es" className="mb-1 text-[var(--step-1)]">
          Contenido base <span className="font-mono text-[var(--step--1)] text-[var(--muted)]">· español</span>
        </h2>
        <p className="mb-4 text-[var(--step--1)] text-[var(--muted)]">
          Lo que se edita aquí es la fuente de verdad. El inglés de más abajo la sobrescribe campo por campo.
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Etiqueta</span>
            <input value={base.label} onChange={(e) => setBase({ ...base, label: e.target.value })} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Titular</span>
            <input value={base.headline} onChange={(e) => setBase({ ...base, headline: e.target.value })} className={inputClass} />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Resumen</span>
            <textarea rows={5} value={base.summary} onChange={(e) => setBase({ ...base, summary: e.target.value })} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Archivo PDF · ES</span>
            <input value={base.pdfFileNameEs} onChange={(e) => setBase({ ...base, pdfFileNameEs: e.target.value })} className={inputClass} />
          </label>
          <label className="block">
            <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Archivo PDF · EN</span>
            <input value={base.pdfFileNameEn} onChange={(e) => setBase({ ...base, pdfFileNameEn: e.target.value })} className={inputClass} />
          </label>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <button
            disabled={pending}
            onClick={() => start(async () => setResult(await saveVariant(base)))}
            className="rounded bg-[var(--phosphor)] px-4 py-2 text-[var(--step--1)] font-medium text-[var(--void)] disabled:opacity-60"
          >
            {pending ? 'Guardando…' : 'Guardar cambios'}
          </button>
          <Status result={result} />
        </div>
      </section>

      <FieldList fields={fields} title="Traducción" />

      <section aria-labelledby="bloques">
        <h2 id="bloques" className="mb-1 text-[var(--step-1)]">Bloques en esta variante</h2>
        <p className="mb-4 text-[var(--step--1)] text-[var(--muted)]">
          Sin regla, un bloque es visible y conserva su orden natural. La prioridad más baja sube al frente.
        </p>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[var(--line)] font-mono text-[0.7rem] uppercase tracking-wide text-[var(--muted)]">
              <th scope="col" className="py-2 pr-4 font-normal">Bloque</th>
              <th scope="col" className="py-2 pr-4 font-normal">Visible</th>
              <th scope="col" className="py-2 pr-4 font-normal">Prioridad</th>
              <th scope="col" className="py-2 font-normal">Regla</th>
            </tr>
          </thead>
          <tbody>
            {blocks.map((b) => (
              <BlockRow key={`${b.entityType}-${b.entityId}`} block={b} variantId={variant.id} />
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
