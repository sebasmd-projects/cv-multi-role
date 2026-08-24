import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, schema } from '@/db/client';

/**
 * Un solo administrador. Sin registro, sin recuperación por correo, sin OAuth:
 * cada una de esas rutas es superficie de ataque que este sitio no necesita.
 */

const credentials = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt', maxAge: 8 * 60 * 60 }, // 8 h (§4)
  pages: { signIn: '/admin/login' },
  trustHost: true,
  providers: [
    Credentials({
      async authorize(raw) {
        const parsed = credentials.safeParse(raw);
        if (!parsed.success) return null;

        const [found] = await db
          .select()
          .from(schema.user)
          .where(eq(schema.user.email, parsed.data.email))
          .limit(1);

        // Se compara siempre, exista o no el usuario: sin esto, el tiempo de
        // respuesta revela qué correos están registrados.
        const hash = found?.passwordHash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalid';
        const ok = await bcrypt.compare(parsed.data.password, hash);
        if (!ok || !found) return null;

        await db
          .update(schema.user)
          .set({ lastLogin: new Date() })
          .where(eq(schema.user.id, found.id));
        await db.insert(schema.auditLog).values({
          userId: found.id, action: 'login', entity: 'user', entityId: found.id,
        });

        return { id: String(found.id), email: found.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.uid = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.uid) session.user.id = token.uid as string;
      return session;
    },
  },
});
