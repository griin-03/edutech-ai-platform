// Action lấy kết quả thi của khóa học mình dạy
const results = await prisma.examResult.findMany({
    where: { 
      course: { authorId: userId } // Chỉ lấy kết quả bài thi thuộc khóa của tôi
    },
    include: { user: true, course: true },
    orderBy: { violationCount: 'desc' } // Xếp ai gian lận nhiều nhất lên đầu
  });