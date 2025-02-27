import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // ✅ Ensure correct path

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; // ✅ Export handler for both GET and POST requests