import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import DashboardUI from "./DashboardUI";

export default async function DashboardPage() {
  // 1. Lấy thông tin người đang đăng nhập
  const session = await getServerSession(authOptions);

  // 2. Nếu chưa đăng nhập -> Đá về trang login
  if (!session) {
    redirect("/login");
  }

  // 3. Có session rồi -> Truyền user thật vào giao diện
  // Lúc này session.user đã chứa đúng: name="Tùng Lê", email="admin@gmail.com"
  return <DashboardUI user={session.user} />;
}