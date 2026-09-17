import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import pool from "@/lib/db";
import { SECRET_KEY } from "@/lib/auth";
import { SignJWT } from "jose";
import { cookies } from "next/headers";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  // Não usamos sessão do NextAuth — geramos nosso próprio auth_token
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;

      try {
        // Upsert: cria usuário se não existir, senão busca o existente
        const [rows]: any = await pool.query(
          "SELECT id, role FROM Users WHERE email = ?",
          [user.email.toLowerCase()]
        );

        let userId: number;
        let role: string;

        if (rows.length === 0) {
          const [result]: any = await pool.query(
            "INSERT INTO Users (name, email, password_hash, role, auth_provider, onboarding_complete) VALUES (?, ?, '', 'student', 'google', 0)",
            [user.name ?? user.email, user.email.toLowerCase()]
          );
          userId = result.insertId;
          role = "student";
        } else {
          userId = rows[0].id;
          role = rows[0].role;
        }

        // Gera o mesmo auth_token JWT que o sistema usa
        const sessionToken = await new SignJWT({ userId, role })
          .setProtectedHeader({ alg: "HS256" })
          .setExpirationTime("2h")
          .sign(SECRET_KEY);

        // Seta o cookie via next/headers (funciona em App Router)
        const cookieStore = await cookies();
        cookieStore.set("auth_token", sessionToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "strict",
          path: "/",
          maxAge: 2 * 60 * 60,
        });

        return true;
      } catch (err) {
        console.error("NextAuth signIn error:", err);
        return false;
      }
    },
    // Armazena userId/role no token NextAuth (usado para redirect pós-login)
    async jwt({ token, user }) {
      return token;
    },
    async session({ session }) {
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Após Google login, redireciona para /api/auth/after-oauth
      // que decide para onde ir (checkout ou dashboard)
      return `${baseUrl}/api/auth/after-oauth`;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
    error: "/login",
  },
};
