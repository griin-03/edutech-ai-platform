import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; 
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma"; 
import { revalidatePath } from "next/cache";

export default async function TeacherExamsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login"); 
  }

  const userId = session.user.id;

  // 1. LẤY DỮ LIỆU THẬT & MỚI NHẤT
  const results = await prisma.examResult.findMany({
    where: {
      course: { authorId: Number(userId) }
    },
    include: {
      user: true,
      course: true
    },
    orderBy: [
      { violationCount: 'desc' }, // Gian lận lên đầu
      { createdAt: 'desc' }       // Mới thi lên đầu
    ] 
  });

  // 2. TÍNH TOÁN THỐNG KÊ CHO DASHBOARD
  const totalExams = results.length;
  const cheatersCount = results.filter(r => r.violationCount > 0 && r.violationCount < 99).length;
  const bannedCount = results.filter(r => r.violationCount >= 99).length;
  
  // Tính điểm trung bình (bỏ qua những đứa bị 0 điểm do đình chỉ)
  const validResults = results.filter(r => r.violationCount < 99);
  const avgScore = validResults.length > 0 
    ? (validResults.reduce((acc, curr) => acc + curr.score, 0) / validResults.length).toFixed(1) 
    : 0;

  // 3. SERVER ACTION: CẤM THI
  async function banStudent(formData: FormData) {
    "use server";
    const resultId = formData.get("resultId") as string;
    
    await prisma.examResult.update({
      where: { id: resultId },
      data: { score: 0, violationCount: 99 }
    });
    
    revalidatePath("/teacher/exams");
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* 🌟 HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Quản Lý Kỳ Thi
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
            Giám sát điểm số và phát hiện gian lận tự động bằng AI.
          </p>
        </div>
      </div>

      {/* 🌟 THỐNG KÊ TỔNG QUAN (CARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Tổng bài */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl text-2xl">📝</div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Tổng lượt thi</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{totalExams}</p>
          </div>
        </div>

        {/* Card 2: Điểm trung bình */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-all hover:shadow-md">
          <div className="p-4 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-xl text-2xl">🎯</div>
          <div>
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Điểm trung bình</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">{avgScore} <span className="text-lg text-gray-400 font-medium">/ 10</span></p>
          </div>
        </div>

        {/* Card 3: Cảnh báo */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center gap-4 transition-all hover:shadow-md relative overflow-hidden">
          <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-2xl">🚨</div>
          <div className="z-10">
            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase">Vi phạm / Đình chỉ</p>
            <p className="text-3xl font-black text-gray-900 dark:text-white">
              <span className="text-orange-500">{cheatersCount}</span> <span className="text-xl text-gray-300">|</span> <span className="text-red-600">{bannedCount}</span>
            </p>
          </div>
          {cheatersCount > 0 && <div className="absolute top-0 right-0 w-2 h-full bg-orange-500 animate-pulse"></div>}
        </div>
      </div>

      {/* 🌟 BẢNG DỮ LIỆU CHI TIẾT */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Học viên</th>
                <th className="px-6 py-4 text-left text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Khóa học</th>
                <th className="px-6 py-4 text-center text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Điểm số</th>
                <th className="px-6 py-4 text-center text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Trạng thái AI</th>
                <th className="px-6 py-4 text-right text-xs font-extrabold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700 bg-white dark:bg-slate-800">
              {results.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center text-gray-500 dark:text-gray-400 font-medium">
                    <div className="text-4xl mb-3">📭</div>
                    Chưa có học viên nào nộp bài.
                  </td>
                </tr>
              ) : (
                results.map((result) => (
                  <tr key={result.id} className={`transition-colors duration-200 ${result.violationCount >= 99 ? "bg-red-50/50 dark:bg-red-900/10" : "hover:bg-gray-50 dark:hover:bg-slate-700/50"}`}>
                    
                    {/* Cột Học viên */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-sm">
                          {result.user?.name?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 dark:text-white">{result.user?.name || "Ẩn danh"}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{result.user?.email}</div>
                        </div>
                      </div>
                    </td>

                    {/* Cột Khóa học */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 inline-block px-3 py-1 rounded-lg">
                        {result.course?.title}
                      </div>
                    </td>

                    {/* Cột Điểm */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {result.violationCount >= 99 ? (
                         <span className="text-red-500 dark:text-red-400 font-black text-lg line-through">0.0</span>
                      ) : (
                        <span className={`text-xl font-black ${result.score >= 5 ? 'text-green-600 dark:text-green-400' : 'text-orange-500 dark:text-orange-400'}`}>
                          {result.score.toFixed(1)}
                        </span>
                      )}
                    </td>

                    {/* Cột Trạng thái Gian lận */}
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {result.violationCount >= 99 ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300 border border-red-200 dark:border-red-800">
                          🚫 ĐÌNH CHỈ
                        </span>
                      ) : result.violationCount > 0 ? (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border border-orange-200 dark:border-orange-800 animate-pulse">
                          ⚠️ Vi phạm: {result.violationCount} lần
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300 border border-green-200 dark:border-green-800">
                          ✅ An toàn
                        </span>
                      )}
                    </td>

                    {/* Cột Hành động */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Nút Xem chi tiết (Tương lai) */}
                        <button className="text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 px-3 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 rounded-lg transition-colors">
                          Chi tiết
                        </button>

                        {/* Nút Cấm Thi */}
                        {result.violationCount < 99 && result.violationCount > 0 && (
                          <form action={banStudent}>
                            <input type="hidden" name="resultId" value={result.id} />
                            <button 
                              type="submit" 
                              className="text-sm font-bold text-white bg-red-600 hover:bg-red-700 px-3 py-2 rounded-lg shadow-sm transition-transform active:scale-95"
                              title="Hủy bài thi này"
                            >
                              Cấm thi
                            </button>
                          </form>
                        )}
                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}