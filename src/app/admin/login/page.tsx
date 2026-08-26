import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { LoginForm } from './login-form';
import { TypedName } from '@/components/typed-name';
import '../../globals.css';

// El panel nunca debe aparecer en un buscador.
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect('/admin');

  return (
    <html lang="es">
      <body className="grid min-h-dvh place-items-center px-5">
        <main className="w-full max-w-sm">
          <p className="mb-8 font-mono text-[var(--phosphor)]">
            <TypedName name="Sebastian Morales" />
          </p>
          <h1 className="text-[var(--step-1)]">Panel</h1>
          <p className="mb-6 mt-1 text-[var(--step--1)] text-[var(--muted)]">
            Edición del CV. La sesión dura ocho horas.
          </p>
          <LoginForm />
        </main>
      </body>
    </html>
  );
}
