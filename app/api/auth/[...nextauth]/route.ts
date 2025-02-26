import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

// Extend the User type to include authToken
interface CustomUser extends User {
  authToken: string;
}

// Extend JWT type to store authToken
interface CustomJWT extends JWT {
  authToken?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
if (!API_BASE_URL) {
  throw new Error("Missing environment variable: NEXT_PUBLIC_API_BASE_URL");
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const responseData = await res.json();
          if (!res.ok) throw new Error(responseData.message || "Authentication failed");

          if (!responseData.data || !responseData.token) {
            throw new Error("Invalid response data received");
          }

          return { ...responseData.data, authToken: responseData.token } as CustomUser;
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Internal server error");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: CustomJWT; user?: User | AdapterUser }) {
      if (user && "authToken" in user) {
        token.authToken = (user as CustomUser).authToken; // ✅ Store token in JWT
      }
      console.log("JWT Callback - Token:", token); // Debug log
      return token;
    },
    async session({ session, token }: { session: Session; token: CustomJWT }) {
      if (session.user) {
        (session.user as CustomUser).authToken = token.authToken || ""; // ✅ Ensure authToken is passed
      }
      console.log("Session Callback - Session:", session); // Debug log
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };