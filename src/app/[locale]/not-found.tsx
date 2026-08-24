import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-5">
      <div>
        <p className="font-[family-name:var(--font-mono)] text-[var(--phosphor)]">
          <span aria-hidden="true">&gt; </span>404
        </p>
        {/* Un estado vacío explica qué pasó y ofrece la salida, no pone un chiste. */}
        <h1 className="mt-3 text-[var(--step-1)]">Esta página no existe</h1>
        <p className="mt-2 text-[var(--muted)]">
          Puede que el enlace esté mal escrito o que el caso de estudio ya no esté publicado.
        </p>
        <Link href="/" className="mt-6 inline-block text-[var(--signal)] hover:text-[var(--phosphor)]">
          Ir al CV
        </Link>
      </div>
    </main>
  );
}
