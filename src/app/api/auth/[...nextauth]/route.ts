// FILE: src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth"; // Import từ file cấu hình Bước 2

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };