import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" }, // Bắt buộc dùng JWT để lưu Role
  pages: { signIn: "/login" },
  
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // 1. Kiểm tra đầu vào
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Vui lòng nhập đầy đủ email và mật khẩu");
        }

        // 2. Tìm user trong DB
        const user = await prisma.user.findUnique({ 
          where: { email: credentials.email } 
        });

        if (!user) throw new Error("Email không tồn tại trong hệ thống");
        if (!user.password) throw new Error("Tài khoản này dùng đăng nhập Google, vui lòng chọn Google");

        // 3. Kiểm tra mật khẩu
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Mật khẩu không chính xác");

        // 4. Trả về thông tin User (Kèm Role)
        console.log("✅ [LOGIN] Tìm thấy user:", user.email, "| Role:", user.role); 
        
        return {
          id: user.id.toString(), // Chuyển sang String chuẩn NextAuth
          name: user.name,
          email: user.email,
          image: user.avatar,
          role: user.role, // QUAN TRỌNG: Lấy role từ DB
        };
      }
    })
  ],

  callbacks: {
    // 1. Hàm JWT: Chạy khi đăng nhập thành công -> Lưu Role vào Token
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role; // Lưu role vào token
        token.picture = user.image;
      }

      // Hỗ trợ update profile sau này (nếu cần)
      if (trigger === "update" && session) {
        token.name = session.name;
        token.picture = session.image;
      }
      
      return token;
    },

    // 2. Hàm Session: Chạy mỗi khi F5 hoặc gọi useSession
    async session({ session, token }) {
      if (session.user) {
        // Gán thông tin cơ bản từ Token
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
        
        // --- LOGIC MỚI: QUERY DB ĐỂ LẤY TRẠNG THÁI PRO MỚI NHẤT ---
        // (Khắc phục lỗi nạp tiền xong nhưng Session vẫn lưu isPro cũ)
        if (token.sub) {
          const freshUser = await prisma.user.findUnique({
            where: { id: parseInt(token.sub) }, // Chú ý: ID trong DB là Int, Token là String
            select: { isPro: true, role: true }
          });

          if (freshUser) {
            (session.user as any).isPro = freshUser.isPro; // Cập nhật isPro realtime
            (session.user as any).role = freshUser.role;   // Cập nhật role realtime
          } else {
             // Fallback nếu query lỗi (ít khi xảy ra)
            (session.user as any).role = token.role;
          }
        } else {
            (session.user as any).role = token.role;
        }
      }
      return session;
    }
  }
};