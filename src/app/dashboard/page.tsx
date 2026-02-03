import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // --- LOG ĐỂ TÌM LỖI ---
  const rawRole = (session.user as any).role;
  console.log("====================================");
  console.log("🔍 ĐANG KIỂM TRA TẠI /dashboard");
  console.log("👤 User:", session.user?.email);
  console.log("🔑 Role gốc từ Session:", rawRole);
  console.log("====================================");

  // Xử lý role an toàn (chuyển về chữ hoa)
  const role = (rawRole || "STUDENT").toString().toUpperCase();

  if (role === "ADMIN") {
    redirect("/admin/dashboard");
  } else if (role === "TEACHER") {
    redirect("/teacher/dashboard");
  } else {
    redirect("/student/dashboard");
  }
}