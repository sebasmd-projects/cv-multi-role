'use client';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5">
      <div>
        <p className="font-[family-name:var(--font-mono)] text-[var(--pulse)]">
          <span aria-hidden="true">&gt; </span>error
        </p>
        <h1 className="mt-3 text-[var(--step-1)]">No se pudo cargar el CV</h1>
        <p className="mt-2 text-[var(--muted)]">
          Suele ser la conexión con la base de datos. Reintentar arregla la mayoría de los casos.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded bg-[var(--phosphor)] px-4 py-2 font-medium text-[var(--void)]"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
