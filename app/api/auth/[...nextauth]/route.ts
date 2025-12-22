import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";



export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credenciales",
       credentials: { email: { label: "Email", type: "email" }, password: { label: "Password", type: "password" }},
      async authorize(credentials:any) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        return { id: String(user._id), email: user.email, name: user.name, role: user.role };
      }
    })
  ],
session: { strategy: "jwt", maxAge: 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) { if (user) { token.userId = (user as any).id; token.role = (user as any).role; } return token; },
    async session({ session, token }) { if (session.user) { (session.user as any).id = token.userId; (session.user as any).role = token.role; } return session; },
  },
    pages: { signIn: "/login" },
    secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    [process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token"]: {
      name: process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token",
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: process.env.NODE_ENV === "production" },
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };