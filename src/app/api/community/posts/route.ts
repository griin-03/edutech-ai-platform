import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // Lọc theo loại request

    // --- CASE 1: LẤY DANH SÁCH BÌNH LUẬN CỦA 1 BÀI VIẾT ---
    if (type === "COMMENTS") {
        const postId = searchParams.get("postId");
        if (!postId) return NextResponse.json([]);

        const comments = await prisma.comment.findMany({
            where: { 
                postId,
                parentId: null // Chỉ lấy bình luận gốc (Level 1)
            },
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { id: true, name: true, avatar: true } },
                // Lấy kèm các câu trả lời (Level 2)
                replies: {
                    include: { user: { select: { id: true, name: true, avatar: true } } },
                    orderBy: { createdAt: 'asc' }
                }
            }
        });
        return NextResponse.json(comments);
    }

    // --- CASE 2: LẤY BẢNG TIN (FEED) ---
    const session = await getServerSession(authOptions);
    const userEmail = session?.user?.email;
    let currentUserId = null;
    if (userEmail) {
        const user = await prisma.user.findUnique({ where: { email: userEmail } });
        currentUserId = user?.id;
    }

    const category = searchParams.get("category");
    const q = searchParams.get("q");

    const whereCondition: any = {};
    if (category && category !== "ALL") whereCondition.category = category;
    if (q) whereCondition.content = { contains: q };

    const posts = await prisma.post.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        user: { select: { id: true, name: true, avatar: true, role: true } },
        _count: { select: { likes: true, comments: true } },
        likes: currentUserId ? { where: { userId: currentUserId } } : false
      }
    });

    const formattedPosts = posts.map(p => ({
        ...p,
        isLiked: p.likes.length > 0,
        likeCount: p._count.likes,
        commentCount: p._count.comments
    }));

    return NextResponse.json(formattedPosts);

  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: session.user.email } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { action, content, category, postId, parentId } = body;

    // A. TẠO BÀI VIẾT
    if (action === "CREATE_POST") {
        const newPost = await prisma.post.create({
            data: { content, category: category || "SHARING", userId: user.id }
        });
        return NextResponse.json(newPost);
    }

    // B. LIKE / UNLIKE
    if (action === "TOGGLE_LIKE") {
        const existingLike = await prisma.like.findUnique({
            where: { userId_postId: { userId: user.id, postId } }
        });
        if (existingLike) {
            await prisma.like.delete({ where: { userId_postId: { userId: user.id, postId } } });
            return NextResponse.json({ isLiked: false });
        } else {
            await prisma.like.create({ data: { userId: user.id, postId } });
            return NextResponse.json({ isLiked: true });
        }
    }

    // C. BÌNH LUẬN & TRẢ LỜI
    if (action === "CREATE_COMMENT") {
        if (!content?.trim()) return NextResponse.json({ error: "Empty" }, { status: 400 });
        
        const newComment = await prisma.comment.create({
            data: {
                content,
                postId,
                userId: user.id,
                parentId: parentId || null // Nếu có parentId thì là Reply
            },
            include: {
                user: { select: { id: true, name: true, avatar: true } }
            }
        });
        return NextResponse.json(newComment);
    }

    return NextResponse.json({ error: "Invalid Action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}