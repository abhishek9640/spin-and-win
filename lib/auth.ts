import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import type { Session, User } from "next-auth";
import type { AdapterUser } from "next-auth/adapters";

interface CustomUser extends User {
  authToken: string;
  role: "admin" | "user"; // Add role to differentiate
}

interface CustomJWT extends JWT {
  authToken?: string;
  role?: "admin" | "user"; // Store role in token
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
          console.log("🔹 Received credentials:", credentials);

          // Determine API endpoint based on email
          if (!credentials) {
            throw new Error("Missing credentials");
          }
          const isAdmin = credentials.email === "admin@gmail.com";
          const loginEndpoint = isAdmin
            ? `${API_BASE_URL}/api/v1/admin/login`
            : `${API_BASE_URL}/api/v1/auth/login`;

          const res = await fetch(loginEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials),
          });

          const responseData = await res.json();
          console.log("🔹 API Response:", responseData);

          if (!res.ok) {
            console.error("❌ Login failed:", responseData.message);
            throw new Error(responseData.message || "Authentication failed");
          }

          if (!responseData.data || !responseData.data.token) {
            console.error("❌ Invalid API response:", responseData);
            throw new Error("Invalid response data received");
          }

          console.log("✅ User authenticated:", responseData.data);

          return {
            id: responseData.data._id,
            username: responseData.data.username,
            email: responseData.data.email,
            profile_pic: responseData.data.profile_pic?.Location || null,
            authToken: responseData.data.token,
            role: isAdmin ? "admin" : "user", // Set user role
          };
        } catch (error) {
          console.error("🚨 Authorization error:", error);
          throw new Error(error instanceof Error ? error.message : "Internal server error");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: { token: CustomJWT; user?: User | AdapterUser }) {
      if (user && "authToken" in user) {
        token.authToken = (user as CustomUser).authToken;
        token.role = (user as CustomUser).role;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: CustomJWT }) {
      if (session.user) {
        (session.user as CustomUser).authToken = token.authToken || "";
        (session.user as CustomUser).role = token.role || "user";
      }
      return session;
    },

    async redirect({ baseUrl, token }: { url: string; baseUrl: string; token?: CustomJWT }) {
      if (token?.role === "admin") {
        return `${baseUrl}/admin`; // Redirect to admin panel
      }
      return baseUrl; // Default redirect
    },
  },
  
  secret: process.env.NEXTAUTH_SECRET,
};
