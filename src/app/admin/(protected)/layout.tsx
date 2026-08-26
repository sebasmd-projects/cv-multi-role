import Link from 'next/link';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { TypedName } from '@/components/typed-name';
import '../../globals.css';

/**
 * El panel es una herramienta, no una vitrina: mismos tokens que el sitio,
 * cero adorno. La audacia visual está reservada al hero público (§7).
 */

const NAV = [
  ['/admin', 'Resumen'],
  ['/admin/variantes', 'Variantes'],
  ['/admin/perfil', 'Perfil'],
  ['/admin/experiencia', 'Experiencia'],
  ['/admin/habilidades', 'Habilidades'],
  ['/admin/proyectos', 'Proyectos'],
  ['/admin/pdf', 'PDF'],
  ['/admin/seo', 'SEO'],
  ['/admin/analitica', 'Analítica'],
] as const;

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/admin/login');

  return (
    <html lang="es">
      <body className="min-h-dvh">
        <div className="mx-auto flex max-w-[1400px] flex-col md:flex-row">
          <aside className="border-b border-[var(--line)] md:min-h-dvh md:w-56 md:border-b-0 md:border-r">
            <div className="px-5 py-5 font-mono text-[var(--step--1)] text-[var(--phosphor)]">
              <TypedName name="Sebastian Morales" />
            </div>
            <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible">
              {NAV.map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="whitespace-nowrap rounded px-3 py-2 text-[var(--step--1)] text-[var(--muted)] transition-colors hover:text-[var(--phosphor)]"
                >
                  {label}
                </Link>
              ))}
            </nav>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/admin/login' });
              }}
              className="px-3 py-4"
            >
              <button className="px-3 py-2 text-[var(--step--1)] text-[var(--muted)] hover:text-[var(--pulse)]">
                Cerrar sesión
              </button>
            </form>
          </aside>
          <main className="min-w-0 flex-1 px-5 py-8 md:px-10">{children}</main>
        </div>
      </body>
    </html>
  );
}
