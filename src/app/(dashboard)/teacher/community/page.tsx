"use client";

import { useEffect, useState } from "react";
import { createTeacherPost, getCommunityPosts } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  MessageSquare, Heart, Share2, Send, 
  Loader2, GraduationCap, CheckCircle2 
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function TeacherCommunityPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    const data = await getCommunityPosts();
    setPosts(data);
    setLoading(false);
  };

  const handlePost = async () => {
    if (!content.trim()) return;
    setIsPosting(true);
    
    const formData = new FormData();
    formData.append("content", content);
    
    const res = await createTeacherPost(formData);
    if (res.success) {
      toast.success("Đã đăng bài viết thành công!");
      setContent("");
      loadPosts();
    } else {
      toast.error("Có lỗi xảy ra");
    }
    setIsPosting(false);
  };

  // Hàm hiển thị Badge uy tín
  const renderUserBadge = (role: string) => {
    if (role === "TEACHER" || role === "ADMIN") {
      return (
        <Badge variant="secondary" className="bg-violet-100 text-violet-700 hover:bg-violet-200 border-violet-200 gap-1 ml-2">
           <CheckCircle2 className="w-3 h-3" /> Giảng viên
        </Badge>
      );
    }
    return <Badge variant="outline" className="text-slate-500 ml-2">Học viên</Badge>;
  };

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen animate-in fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Cộng đồng Học tập</h1>
          <p className="text-slate-500">Nơi trao đổi, giải đáp thắc mắc giữa Thầy và Trò.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT TRÁI: KHU VỰC ĐĂNG BÀI & FEED */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. KHUNG ĐĂNG BÀI (TEACHER) */}
          <Card className="shadow-md border-none">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <div className="bg-violet-100 p-3 rounded-full h-fit">
                   <GraduationCap className="w-6 h-6 text-violet-600" />
                </div>
                <div className="flex-1 space-y-4">
                  <Textarea 
                    placeholder="Chia sẻ kiến thức hoặc thông báo mới cho học viên..." 
                    className="min-h-[100px] border-slate-200 resize-none focus:ring-violet-500"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-slate-400">Đăng với tư cách Giảng viên</div>
                    <Button 
                      onClick={handlePost} 
                      disabled={isPosting || !content.trim()} 
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      {isPosting ? <Loader2 className="animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      Đăng bài
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 2. FEED BÀI VIẾT */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="bg-white p-1 border">
              <TabsTrigger value="all">Tất cả thảo luận</TabsTrigger>
              <TabsTrigger value="my">Bài của tôi</TabsTrigger>
              <TabsTrigger value="hot" className="text-orange-500">🔥 Sôi nổi nhất</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="space-y-4 mt-4">
              {loading ? (
                <div className="flex justify-center p-12"><Loader2 className="animate-spin text-violet-600" /></div>
              ) : posts.length === 0 ? (
                 <p className="text-center text-slate-500 py-10">Chưa có bài viết nào.</p>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-start gap-4 pb-2">
                      <Avatar>
                        <AvatarImage src={post.user.avatar} />
                        <AvatarFallback>{post.user.name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="font-bold text-slate-900">{post.user.name}</span>
                            {/* LOGIC HIỂN THỊ BADGE GIẢNG VIÊN */}
                            {renderUserBadge(post.user.role)}
                          </div>
                          <span className="text-xs text-slate-400">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: vi })}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {post.user.role === 'TEACHER' ? 'Đã đăng một thông báo' : 'Đã đặt một câu hỏi'}
                        </p>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-4">
                       <div className="text-slate-700 whitespace-pre-wrap leading-relaxed">
                          {post.content}
                       </div>
                    </CardContent>
                    
                    {/* FOOTER TƯƠNG TÁC */}
                    <div className="px-6 pb-4 pt-0 flex items-center gap-6 border-t pt-4 mt-2">
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-pink-500 hover:bg-pink-50">
                        <Heart className="w-4 h-4 mr-2" /> {post._count.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-500 hover:bg-blue-50">
                        <MessageSquare className="w-4 h-4 mr-2" /> {post._count.comments} Thảo luận
                      </Button>
                      <Button variant="ghost" size="sm" className="text-slate-500 ml-auto">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* CỘT PHẢI: SIDEBAR THÔNG TIN */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-none">
             <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Mẹo cho Giảng viên</h3>
                <ul className="space-y-2 text-sm text-violet-100 list-disc pl-4">
                   <li>Thường xuyên trả lời câu hỏi để tăng uy tín.</li>
                   <li>Ghim các thông báo quan trọng lên đầu.</li>
                   <li>Tạo các cuộc thi nhỏ để tăng tương tác.</li>
                </ul>
             </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="text-base">Chủ đề đang Hot</CardTitle></CardHeader>
            <CardContent className="space-y-3">
               {["#Lập trình Java", "#Hỏi đáp bài tập", "#Chia sẻ tài liệu", "#Fix lỗi Spring Boot"].map((tag, i) => (
                  <div key={i} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded cursor-pointer">
                     <span className="font-medium text-slate-700">{tag}</span>
                     <span className="text-xs bg-slate-100 px-2 py-1 rounded text-slate-500">120+ bài</span>
                  </div>
               ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}