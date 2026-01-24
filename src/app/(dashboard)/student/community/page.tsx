"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { 
  Search, Filter, Plus, Heart, MessageCircle, Share2, MoreHorizontal, 
  Flag, Star, TrendingUp, Users, Zap, MessageSquare, FileText, 
  HelpCircle, Flame, ChevronLeft, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- 1. DUMMY DATA GENERATOR ---
const USERS = [
  { name: "Nguyễn Văn A", avatar: "https://github.com/shadcn.png", role: "Student", color: "bg-blue-100 text-blue-700" },
  { name: "Trần Thị B", avatar: "https://i.pravatar.cc/150?u=2", role: "Top Contributor", color: "bg-amber-100 text-amber-700" },
  { name: "Lê C", avatar: "https://i.pravatar.cc/150?u=3", role: "Moderator", color: "bg-purple-100 text-purple-700" },
  { name: "Phạm D", avatar: "https://i.pravatar.cc/150?u=4", role: "Teacher", color: "bg-emerald-100 text-emerald-700" },
];

const TAGS = ["IELTS", "ReactJS", "Calculus", "Tips", "Career", "Event"];

const POSTS = Array.from({ length: 30 }).map((_, i) => {
  const user = USERS[i % USERS.length];
  const type = i % 3 === 0 ? "discussion" : i % 3 === 1 ? "question" : "resource";
  const likes = Math.floor(Math.random() * 500);
  const comments = Math.floor(Math.random() * 100);
  
  return {
    id: i + 1,
    author: user,
    time: `${Math.floor(Math.random() * 23) + 1} giờ trước`,
    type: type,
    title: i % 3 === 0 
      ? `Làm thế nào để đạt 8.0 IELTS Reading trong 3 tháng? (Phần ${i+1})` 
      : i % 3 === 1 
      ? `Lỗi "Hydration failed" trong Next.js 14 xử lý sao ạ?` 
      : `Tổng hợp tài liệu Giải tích 2 Full PDF + Lời giải chi tiết`,
    content: "Chào mọi người, mình đang gặp chút khó khăn trong việc tìm kiếm tài liệu chuẩn. Ai có kinh nghiệm chia sẻ giúp mình với nhé! Cảm ơn cả nhà nhiều ❤️",
    tags: [TAGS[i % TAGS.length], TAGS[(i + 1) % TAGS.length]],
    likes: likes,
    comments: comments,
    views: (likes * 10).toLocaleString(),
  };
});

const PostTypeBadge = ({ type }: { type: string }) => {
  switch (type) {
    case "question": return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 gap-1"><HelpCircle size={10} /> Hỏi đáp</Badge>;
    case "resource": return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 gap-1"><FileText size={10} /> Tài liệu</Badge>;
    default: return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1"><MessageSquare size={10} /> Thảo luận</Badge>;
  }
};

export default function CommunityPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State quản lý ẩn/hiện Sidebar

  const filteredPosts = useMemo(() => {
    let data = [...POSTS];
    if (activeTab !== "all") data = data.filter(post => post.type === activeTab);
    if (searchTerm) {
      data = data.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (sortOrder === "popular") data.sort((a, b) => b.likes - a.likes);
    else data.sort((a, b) => b.id - a.id);
    return data;
  }, [searchTerm, activeTab, sortOrder]);

  return (
    // CONTAINER CHÍNH: h-[calc(100vh-8rem)] để fit màn hình, overflow-hidden để chặn cuộn body
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl relative animate-in zoom-in-95 fade-in duration-500">
      
      {/* =====================================================================================
          1. LEFT SIDEBAR (MENU & FILTERS) - CÓ THỂ ẨN HIỆN
         ===================================================================================== */}
      <div className={cn(
        "border-r border-stone-200 dark:border-stone-800 bg-[#fdfbf7]/90 dark:bg-[#151311]/90 backdrop-blur-xl shrink-0 flex flex-col transition-all duration-300 ease-in-out",
        isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden border-none"
      )}>
        <div className="p-6 shrink-0">
           <h2 className="text-xl font-black text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-6 whitespace-nowrap">
             <Users className="text-amber-600" /> Cộng đồng
           </h2>
           
           <div className="space-y-1">
             {[
               { id: "all", label: "Tất cả tin", icon: Zap },
               { id: "discussion", label: "Thảo luận", icon: MessageSquare },
               { id: "question", label: "Hỏi đáp", icon: HelpCircle },
               { id: "resource", label: "Tài liệu", icon: FileText },
             ].map((item) => (
               <button
                 key={item.id}
                 onClick={() => setActiveTab(item.id)}
                 className={cn(
                   "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
                   activeTab === item.id 
                     ? "bg-white dark:bg-stone-800 text-amber-600 shadow-sm border border-stone-100 dark:border-stone-700" 
                     : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-800"
                 )}
               >
                 <item.icon size={18} /> {item.label}
               </button>
             ))}
           </div>
        </div>

        <div className="mt-auto p-6 shrink-0">
           <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 whitespace-nowrap overflow-hidden">
              <p className="font-bold text-sm mb-1">Tham gia Premium</p>
              <p className="text-xs opacity-90 mb-3">Đăng bài không giới hạn.</p>
              <Button size="sm" variant="secondary" className="w-full text-xs font-bold text-amber-700">Nâng cấp ngay</Button>
           </div>
        </div>
      </div>

      {/* =====================================================================================
          2. MAIN FEED (CENTER) - CÓ SCROLL RIÊNG
         ===================================================================================== */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-50/50 dark:bg-[#0c0a09]">
        
        {/* Sticky Header */}
        <div className="h-16 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 sticky top-0">
           {/* Sidebar Toggle & Search */}
           <div className="flex items-center gap-3 w-full max-w-lg">
              {/* NÚT TAM GIÁC ẨN/HIỆN MENU */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0"
                title={isSidebarOpen ? "Ẩn Menu" : "Hiện Menu"}
              >
                {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}
              </Button>

              <div className="relative w-full group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                 <Input 
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Tìm kiếm bài viết..." 
                   className="pl-10 bg-stone-100 dark:bg-stone-900 border-transparent focus:bg-white dark:focus:bg-black focus:border-amber-500 transition-all rounded-xl h-10" 
                 />
              </div>
           </div>

           {/* Actions */}
           <div className="flex items-center gap-2 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex gap-2 text-stone-600 dark:text-stone-300 border-stone-200 dark:border-stone-800 rounded-lg">
                    <Filter size={16} /> <span className="hidden md:inline">{sortOrder === 'newest' ? "Mới nhất" : "Phổ biến"}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sắp xếp theo</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortOrder} onValueChange={setSortOrder}>
                    <DropdownMenuRadioItem value="newest">Mới nhất</DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="popular">Phổ biến nhất</DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button size="sm" className="bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-amber-600 dark:hover:bg-amber-400 shadow-lg shadow-stone-900/10 gap-2 font-bold rounded-lg px-3 sm:px-4">
                 <Plus size={18} /> <span className="hidden sm:inline">Đăng bài</span>
              </Button>
           </div>
        </div>

        {/* Scrollable Feed - THANH CUỘN CHÍNH Ở ĐÂY */}
        {/* flex-1 và overflow-hidden ở container cha + h-full ở ScrollArea đảm bảo cuộn đúng */}
        <div className="flex-1 overflow-hidden relative">
           <ScrollArea className="h-full w-full px-4 sm:px-0">
              <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
                 {filteredPosts.length > 0 ? (
                   filteredPosts.map((post, index) => (
                     <Card 
                       key={post.id} 
                       className="border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-lg hover:shadow-amber-900/5 transition-all duration-300 animate-in slide-in-from-bottom-4 fade-in fill-mode-forwards"
                       style={{ animationDelay: `${index * 50}ms` }} 
                     >
                       <CardHeader className="flex flex-row items-start justify-between pb-3 p-4 sm:p-6">
                          <div className="flex gap-3">
                             <Avatar className="cursor-pointer hover:ring-2 ring-amber-500 transition-all">
                                <AvatarImage src={post.author.avatar} />
                                <AvatarFallback>{post.author.name[0]}</AvatarFallback>
                             </Avatar>
                             <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                   <h4 className="font-bold text-sm text-stone-800 dark:text-stone-100 hover:text-amber-600 cursor-pointer">{post.author.name}</h4>
                                   <Badge variant="secondary" className={`text-[10px] h-5 px-1.5 ${post.author.color}`}>{post.author.role}</Badge>
                                </div>
                                <p className="text-xs text-stone-400 mt-0.5">{post.time} • <span className="inline-flex items-center gap-1 ml-1"><Users size={10}/> {post.views}</span></p>
                             </div>
                          </div>
                          <DropdownMenu>
                             <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="text-stone-400 hover:text-stone-600 -mr-2 h-8 w-8"><MoreHorizontal size={18}/></Button>
                             </DropdownMenuTrigger>
                             <DropdownMenuContent align="end">
                                <DropdownMenuItem><Star size={14} className="mr-2"/> Lưu bài viết</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-500"><Flag size={14} className="mr-2"/> Báo cáo</DropdownMenuItem>
                             </DropdownMenuContent>
                          </DropdownMenu>
                       </CardHeader>

                       <CardContent className="pb-3 px-4 sm:px-6">
                          <div className="mb-2">
                             <PostTypeBadge type={post.type} />
                          </div>
                          <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 mb-2 leading-snug cursor-pointer hover:text-amber-600 transition-colors">
                             {post.title}
                          </h3>
                          <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed line-clamp-3">
                             {post.content}
                          </p>
                          <div className="flex gap-2 mt-4 flex-wrap">
                             {post.tags.map((tag, i) => (
                                <span key={i} className="text-xs font-medium text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-md hover:bg-amber-50 hover:text-amber-600 cursor-pointer transition-colors">
                                   #{tag}
                                </span>
                             ))}
                          </div>
                       </CardContent>

                       <CardFooter className="pt-0 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 px-4 sm:px-6 py-3">
                          <div className="flex gap-4">
                             <Button variant="ghost" size="sm" className="text-stone-500 hover:text-red-500 hover:bg-red-50 gap-1 px-2 h-8">
                                <Heart size={18} /> <span className="text-xs font-bold">{post.likes}</span>
                             </Button>
                             <Button variant="ghost" size="sm" className="text-stone-500 hover:text-blue-500 hover:bg-blue-50 gap-1 px-2 h-8">
                                <MessageCircle size={18} /> <span className="text-xs font-bold">{post.comments}</span>
                             </Button>
                          </div>
                          <Button variant="ghost" size="sm" className="text-stone-400 hover:text-stone-600 h-8 w-8 px-0">
                             <Share2 size={18} />
                          </Button>
                       </CardFooter>
                     </Card>
                   ))
                 ) : (
                   <div className="text-center py-20">
                      <div className="inline-block p-4 rounded-full bg-stone-100 dark:bg-stone-800 mb-3"><Search size={32} className="text-stone-300"/></div>
                      <p className="text-stone-500 font-medium">Không tìm thấy bài viết nào.</p>
                      <Button variant="link" onClick={() => {setSearchTerm(""); setActiveTab("all")}} className="text-amber-600">Xóa bộ lọc</Button>
                   </div>
                 )}
              </div>
           </ScrollArea>
        </div>
      </div>

      {/* =====================================================================================
          3. RIGHT SIDEBAR (TRENDING) - ẨN TRÊN MOBILE, CỐ ĐỊNH CHIỀU CAO
         ===================================================================================== */}
      <div className="w-80 border-l border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-[#12100e] shrink-0 hidden xl:flex flex-col">
         <div className="p-6 border-b border-stone-200 dark:border-stone-800 shrink-0">
            <h3 className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-4">
               <TrendingUp size={18} className="text-rose-500" /> Xu hướng tìm kiếm
            </h3>
            <div className="flex flex-wrap gap-2">
               {["#IELTS_Writing", "#ReactJS", "#Thi_THPTQG", "#Review_CV", "#Internship"].map((tag, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-amber-100 hover:text-amber-700 transition-colors bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-400 border-0">
                     {tag}
                  </Badge>
               ))}
            </div>
         </div>

         {/* Scrollable Right Sidebar */}
         <ScrollArea className="flex-1 p-6">
            <h3 className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-4">
               <Flame size={18} className="text-orange-500" /> Top đóng góp tuần
            </h3>
            <div className="space-y-4">
               {USERS.map((user, i) => (
                  <div key={i} className="flex items-center gap-3 group cursor-pointer">
                     <div className="relative">
                        <Avatar className="h-10 w-10 border-2 border-transparent group-hover:border-amber-500 transition-all">
                           <AvatarImage src={user.avatar} />
                           <AvatarFallback>{user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="absolute -bottom-1 -right-1 bg-stone-800 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white dark:border-black">
                           {i + 1}
                        </div>
                     </div>
                     <div className="flex-1 overflow-hidden">
                        <p className="text-sm font-bold text-stone-700 dark:text-stone-200 truncate group-hover:text-amber-600">{user.name}</p>
                        <p className="text-xs text-stone-400 flex items-center gap-1">
                           <Star size={10} className="fill-yellow-400 text-yellow-400"/> {Math.floor(Math.random() * 5000)} pts
                        </p>
                     </div>
                     <Button size="sm" variant="ghost" className="text-amber-600 bg-amber-50 hover:bg-amber-100 h-8 px-3 rounded-full text-xs font-bold">
                        Follow
                     </Button>
                  </div>
               ))}
            </div>

            {/* Banner Event */}
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl text-white shadow-lg relative overflow-hidden group cursor-pointer">
               <div className="absolute -right-4 -top-4 w-20 h-20 bg-white/20 rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
               <div className="relative z-10">
                  <Badge className="bg-white/20 text-white border-0 mb-2 backdrop-blur-sm">SỰ KIỆN</Badge>
                  <h4 className="font-bold text-lg leading-tight mb-1">Hackathon 2026</h4>
                  <p className="text-xs text-purple-100 mb-3">Tham gia ngay để nhận giải thưởng lên tới 50 triệu đồng.</p>
                  <Button size="sm" className="w-full bg-white text-purple-700 hover:bg-purple-50 border-0 font-bold h-8">Đăng ký ngay</Button>
               </div>
            </div>
         </ScrollArea>
      </div>

    </div>
  );
}