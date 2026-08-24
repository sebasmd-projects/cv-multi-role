'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const field =
    'w-full rounded border border-[var(--line)] bg-[var(--surface)] px-3 py-2 text-[var(--text)]';

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);

    start(async () => {
      const res = await signIn('credentials', {
        email: String(data.get('email') ?? ''),
        password: String(data.get('password') ?? ''),
        redirect: false,
      });

      // Un solo mensaje para credenciales incorrectas: distinguir «el correo no
      // existe» de «la contraseña es incorrecta» revelaría qué cuentas hay.
      if (res?.error) setError('Correo o contraseña incorrectos.');
      else router.push('/admin');
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <label className="block">
        <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Correo</span>
        <input name="email" type="email" autoComplete="username" required className={field} />
      </label>

      <label className="block">
        <span className="mb-1 block font-mono text-[0.7rem] text-[var(--muted)]">Contraseña</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          minLength={8}
          className={field}
        />
      </label>

      <p role="alert" aria-live="polite" className="min-h-5 text-[var(--step--1)] text-[var(--pulse)]">
        {error}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded bg-[var(--phosphor)] px-4 py-3 font-medium text-[var(--void)] disabled:opacity-60"
      >
        {pending ? 'Entrando…' : 'Entrar'}
      </button>
    </form>
  );
}
