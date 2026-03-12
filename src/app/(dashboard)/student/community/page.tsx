"use client";

import { useState, useEffect, useMemo } from "react";
import { useSession } from "next-auth/react"; 
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuLabel 
} from "@/components/ui/dropdown-menu";
import { 
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger 
} from "@/components/ui/dialog"; 
import { 
  Search, Filter, Plus, Heart, MessageCircle, Share2, MoreHorizontal, 
  Flag, Star, TrendingUp, Users, Zap, MessageSquare, FileText, 
  HelpCircle, Flame, ChevronLeft, ChevronRight, Loader2, Send, CornerDownRight, Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link"; 

// --- CÁC COMPONENT PHỤ ---
const POST_TYPES = [
  { id: "ALL", label: "Tất cả tin", icon: Zap },
  { id: "DISCUSSION", label: "Thảo luận", icon: MessageSquare },
  { id: "Q&A", label: "Hỏi đáp", icon: HelpCircle },
  { id: "SHARING", label: "Tài liệu", icon: FileText },
];

const PostTypeBadge = ({ type }: { type: string }) => {
  switch (type) {
    case "Q&A": return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200 gap-1"><HelpCircle size={10} /> Hỏi đáp</Badge>;
    case "SHARING": return <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 gap-1"><FileText size={10} /> Tài liệu</Badge>;
    default: return <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 gap-1"><MessageSquare size={10} /> Thảo luận</Badge>;
  }
};

// --- COMPONENT HIỂN THỊ BÌNH LUẬN ---
const CommentItem = ({ comment, onReply }: { comment: any, onReply: (user: string, id: string) => void }) => {
    // 🔥 NHẬN DIỆN NGƯỜI BÌNH LUẬN LÀ PRO HAY KHÔNG
    const isCommenterPro = comment.user?.isPro === true; 

    return (
        <div className="flex gap-3 text-sm group">
            {/* AVATAR BÌNH LUẬN (Có viền Vàng nếu là Pro) */}
            <div className={cn("relative rounded-full p-0.5 mt-1 shrink-0", isCommenterPro ? "bg-gradient-to-tr from-amber-400 to-yellow-600 shadow-sm" : "bg-transparent")}>
                <Avatar className="h-8 w-8 border border-white dark:border-stone-900">
                    <AvatarImage src={comment.user?.avatar} />
                    <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
                </Avatar>
                {isCommenterPro && <div className="absolute -top-1 -right-1 bg-white dark:bg-stone-900 rounded-full p-0.5"><Crown className="w-3 h-3 text-amber-500 fill-amber-500"/></div>}
            </div>

            <div className="flex-1">
                <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl px-3 py-2 w-fit">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <p className="font-bold text-stone-800 dark:text-stone-200 text-xs">{comment.user?.name}</p>
                        {isCommenterPro && <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-1 py-0 text-[8px] h-3 uppercase font-black"><Crown size={8} className="mr-0.5"/> Pro</Badge>}
                    </div>
                    <p className="text-stone-600 dark:text-stone-300">{comment.content}</p>
                </div>
                <div className="flex gap-3 mt-1 ml-2">
                    <button className="text-[10px] font-bold text-stone-500 hover:text-amber-600 cursor-pointer">Thích</button>
                    <button 
                        onClick={() => onReply(comment.user?.name, comment.id)} 
                        className="text-[10px] font-bold text-stone-500 hover:text-amber-600 cursor-pointer"
                    >
                        Trả lời
                    </button>
                    <span className="text-[10px] text-stone-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>
            </div>
        </div>
    );
};

export default function CommunityPage() {
  const { data: session } = useSession();
  
  // 🔥 KIỂM TRA QUYỀN PRO CỦA BẢN THÂN
  const isCurrentUserPro = (session?.user as any)?.isPro === true;
  
  // STATE CHÍNH
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("ALL");
  const [sortOrder, setSortOrder] = useState("newest");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // STATE ĐĂNG BÀI
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("DISCUSSION");
  const [isPosting, setIsPosting] = useState(false);

  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null); 
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({}); 
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<{name: string, id: string} | null>(null); 
  const [isCommenting, setIsCommenting] = useState(false);

  useEffect(() => { fetchPosts(); }, [activeTab, searchTerm]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.append("category", activeTab);
      if (searchTerm) params.append("q", searchTerm);
      const res = await fetch(`/api/community/posts?${params.toString()}`);
      const data = await res.json();
      if (Array.isArray(data)) setPosts(data);
    } catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const loadComments = async (postId: string) => {
      if (activeCommentPostId === postId) {
          setActiveCommentPostId(null); 
          return;
      }
      setActiveCommentPostId(postId);
      setReplyTo(null); 
      
      if (!commentsData[postId]) {
          setCommentsLoading(prev => ({...prev, [postId]: true}));
          try {
              const res = await fetch(`/api/community/posts?type=COMMENTS&postId=${postId}`);
              const data = await res.json();
              setCommentsData(prev => ({...prev, [postId]: data}));
          } catch(e) { console.error(e); }
          finally { setCommentsLoading(prev => ({...prev, [postId]: false})); }
      }
  };

  const handleSendComment = async (postId: string) => {
    if (!commentContent.trim()) return;
    setIsCommenting(true);
    
    try {
        const res = await fetch("/api/community/posts", {
            method: "POST",
            body: JSON.stringify({ 
                action: "CREATE_COMMENT", 
                postId, 
                content: commentContent,
                parentId: replyTo?.id || null 
            })
        });
        
        const newComment = await res.json();
        if (newComment.id) {
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
            
            setCommentsData(prev => {
                const currentComments = prev[postId] || [];
                if (replyTo?.id) {
                    return {
                        ...prev,
                        [postId]: currentComments.map(c => c.id === replyTo.id ? {...c, replies: [...(c.replies || []), newComment]} : c)
                    };
                } else {
                    return {...prev, [postId]: [newComment, ...currentComments]};
                }
            });

            setCommentContent("");
            setReplyTo(null);
        }
    } catch (e) { console.error(e); } 
    finally { setIsCommenting(false); }
  };

  const handleLike = async (postId: string) => {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 } : p));
    try { await fetch("/api/community/posts", { method: "POST", body: JSON.stringify({ action: "TOGGLE_LIKE", postId }) }); } catch (error) {}
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return;
    setIsPosting(true);
    try {
        const res = await fetch("/api/community/posts", { method: "POST", body: JSON.stringify({ action: "CREATE_POST", content: newPostContent, category: newPostCategory }) });
        const newPost = await res.json();
        if (newPost.id) {
            fetchPosts(); 
            setNewPostContent("");
            setIsPostDialogOpen(false);
        }
    } catch (error) {} finally { setIsPosting(false); }
  };

  const displayedPosts = useMemo(() => {
      let data = [...posts];
      if (sortOrder === "popular") data.sort((a, b) => b.likeCount - a.likeCount);
      return data;
  }, [posts, sortOrder]);

  return (
    // 🔥 ĐÃ MỞ RỘNG CHIỀU CAO XUỐNG SÁT VIỀN (h-[calc(100vh-2rem)])
    <div className="flex h-[calc(100vh-2rem)] w-full overflow-hidden bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl relative">
      
      {/* 1. LEFT SIDEBAR */}
      <div className={cn("border-r border-stone-200 dark:border-stone-800 bg-[#fdfbf7]/90 dark:bg-[#151311]/90 backdrop-blur-xl shrink-0 flex flex-col transition-all duration-300 ease-in-out", isSidebarOpen ? "w-64 opacity-100" : "w-0 opacity-0 overflow-hidden border-none")}>
        <div className="p-6 shrink-0">
           <h2 className="text-xl font-black text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-6 whitespace-nowrap"><Users className="text-amber-600" /> Cộng đồng</h2>
           <div className="space-y-1">
             {POST_TYPES.map((item) => (
               <button key={item.id} onClick={() => setActiveTab(item.id)} className={cn("w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap", activeTab === item.id ? "bg-white dark:bg-stone-800 text-amber-600 shadow-sm border border-stone-100 dark:border-stone-700" : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800")}>
                 <item.icon size={18} /> {item.label}
               </button>
             ))}
           </div>
        </div>
        
        {/* 🔥 THÔNG BÁO TÀI KHOẢN PRO Ở LEFT SIDEBAR */}
        <div className="mt-auto p-6 shrink-0">
           {isCurrentUserPro ? (
               <div className="bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/40 dark:to-stone-900 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 text-amber-900 dark:text-amber-100 shadow-sm whitespace-nowrap overflow-hidden text-center relative">
                  <div className="absolute top-0 right-0 p-2 opacity-20"><Crown size={40}/></div>
                  <Crown className="w-8 h-8 mx-auto text-amber-500 fill-amber-500 mb-2 drop-shadow-sm" />
                  <p className="font-black text-sm mb-1 uppercase tracking-wider text-amber-600 dark:text-amber-400">Tài Khoản PRO</p>
                  <p className="text-xs font-medium opacity-80">Đăng bài & Tải tài liệu không giới hạn.</p>
               </div>
           ) : (
               <div className="bg-gradient-to-br from-stone-900 to-stone-800 dark:from-stone-800 dark:to-stone-900 rounded-2xl p-4 text-white shadow-lg whitespace-nowrap overflow-hidden text-center">
                  <Crown className="w-6 h-6 mx-auto text-amber-400 mb-2 opacity-80" />
                  <p className="font-bold text-sm mb-1 text-amber-400">Tham gia Premium</p>
                  <p className="text-xs opacity-70 mb-3 text-stone-300">Nhận huy hiệu & Không giới hạn.</p>
                  <Link href="/student/pro">
                      <Button size="sm" className="w-full text-xs font-bold bg-amber-500 hover:bg-amber-600 text-stone-900 shadow-md">Nâng cấp ngay</Button>
                  </Link>
               </div>
           )}
        </div>
      </div>

      {/* 2. MAIN FEED */}
      <div className="flex-1 flex flex-col min-w-0 bg-stone-50/50 dark:bg-[#0c0a09]">
        <div className="h-16 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-10 shrink-0 sticky top-0">
           <div className="flex items-center gap-3 w-full max-w-lg">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 shrink-0">{isSidebarOpen ? <ChevronLeft /> : <ChevronRight />}</Button>
              <div className="relative w-full group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                 <Input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Tìm kiếm thảo luận..." className="pl-10 bg-stone-100 dark:bg-stone-900 border-transparent focus:bg-white focus:border-amber-500 transition-all rounded-xl h-10" />
              </div>
           </div>
           <div className="flex items-center gap-2 ml-2">
              <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                  <DialogTrigger asChild><Button size="sm" className="bg-stone-900 text-white hover:bg-amber-600 shadow-lg gap-2 font-bold rounded-lg px-3 sm:px-4"><Plus size={18} /> <span className="hidden sm:inline">Đăng bài</span></Button></DialogTrigger>
                  <DialogContent className="sm:max-w-[525px]">
                      <DialogHeader><DialogTitle>Tạo bài viết mới</DialogTitle></DialogHeader>
                      <div className="grid gap-4 py-4">
                          <Textarea value={newPostContent} onChange={(e) => setNewPostContent(e.target.value)} placeholder="Bạn đang nghĩ gì?" className="min-h-[150px] text-base" />
                          <div className="flex gap-2">{POST_TYPES.filter(t=>t.id!=="ALL").map(t=><Badge key={t.id} variant={newPostCategory===t.id?"default":"outline"} onClick={()=>setNewPostCategory(t.id)} className="cursor-pointer">{t.label}</Badge>)}</div>
                      </div>
                      <DialogFooter><Button onClick={handleCreatePost} disabled={isPosting || !newPostContent.trim()} className="bg-amber-600 hover:bg-amber-700 text-white">{isPosting ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Send className="mr-2 h-4 w-4"/>} Đăng ngay</Button></DialogFooter>
                  </DialogContent>
              </Dialog>
           </div>
        </div>

        <div className="flex-1 overflow-hidden relative">
           <ScrollArea className="h-full w-full px-4 sm:px-0">
              <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-6 pb-20">
                 {loading ? Array.from({length:3}).map((_, i) => <div key={i} className="bg-white p-6 rounded-xl border border-stone-200 space-y-4 animate-pulse h-40"></div>) 
                 : displayedPosts.length > 0 ? displayedPosts.map((post, index) => {
                     // 🔥 KIỂM TRA TÁC GIẢ BÀI ĐĂNG CÓ PHẢI LÀ PRO KHÔNG
                     const isPostAuthorPro = post.user?.isPro === true;

                     return (
                     <Card key={post.id} className="border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-lg transition-all">
                       <CardHeader className="flex flex-row items-start justify-between pb-3 p-4 sm:p-6">
                          <div className="flex gap-3 items-center">
                             
                             {/* AVATAR NGƯỜI ĐĂNG BÀI (Có viền PRO) */}
                             <div className={cn("relative rounded-full p-0.5 shrink-0", isPostAuthorPro ? "bg-gradient-to-tr from-amber-400 to-yellow-600 shadow-md shadow-amber-500/20" : "bg-transparent")}>
                                <Avatar className="h-10 w-10 border-2 border-white dark:border-stone-900">
                                   <AvatarImage src={post.user?.avatar} />
                                   <AvatarFallback>{post.user?.name?.[0]}</AvatarFallback>
                                </Avatar>
                                {isPostAuthorPro && <div className="absolute -top-1.5 -right-1.5 bg-white dark:bg-stone-900 rounded-full p-0.5 shadow-sm"><Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500"/></div>}
                             </div>

                             <div>
                                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                   <h4 className="font-bold text-sm text-stone-800 dark:text-stone-100">{post.user?.name}</h4>
                                   
                                   {/* DANH HIỆU PRO CHO NGƯỜI ĐĂNG */}
                                   {isPostAuthorPro ? (
                                       <Badge className="bg-gradient-to-r from-amber-400 to-amber-500 text-stone-900 hover:from-amber-500 hover:to-amber-600 border-none px-1.5 py-0 text-[9px] h-4 font-black uppercase tracking-wider shadow-sm"><Crown size={10} className="mr-0.5"/> Pro Member</Badge>
                                   ) : (
                                       <Badge variant="secondary" className="text-[10px] h-4 px-1.5 bg-stone-100 text-stone-500">{post.user?.role || "Member"}</Badge>
                                   )}
                                </div>
                                <p className="text-xs text-stone-400">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
                             </div>
                          </div>
                          <Button variant="ghost" size="icon" className="text-stone-400 -mr-2"><MoreHorizontal size={18}/></Button>
                       </CardHeader>
                       <CardContent className="pb-3 px-4 sm:px-6">
                          <div className="mb-2"><PostTypeBadge type={post.category} /></div>
                          <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">{post.content}</p>
                       </CardContent>
                       <CardFooter className="flex-col items-stretch pt-0 border-t border-stone-100 dark:border-stone-800 px-4 sm:px-6">
                          <div className="flex items-center justify-between py-3">
                              <div className="flex gap-4">
                                <Button onClick={() => handleLike(post.id)} variant="ghost" size="sm" className={cn("gap-1 px-2 h-8 transition-colors", post.isLiked ? "text-red-500 bg-red-50" : "text-stone-500 hover:text-red-500")}>
                                    <Heart size={18} fill={post.isLiked ? "currentColor" : "none"} /> <span className="text-xs font-bold">{post.likeCount}</span>
                                </Button>
                                <Button onClick={() => loadComments(post.id)} variant="ghost" size="sm" className={cn("gap-1 px-2 h-8", activeCommentPostId === post.id ? "text-blue-600 bg-blue-50" : "text-stone-500")}>
                                    <MessageCircle size={18} /> <span className="text-xs font-bold">{post.commentCount}</span>
                                </Button>
                              </div>
                              <Button variant="ghost" size="icon" className="text-stone-400 h-8 w-8"><Share2 size={18} /></Button>
                          </div>
                          
                          {/* --- COMMENT SECTION --- */}
                          {activeCommentPostId === post.id && (
                              <div className="animate-in slide-in-from-top-2 fade-in pb-4">
                                  {/* List Comments */}
                                  <div className="space-y-4 mb-4 pl-1">
                                      {commentsLoading[post.id] ? (
                                          <div className="flex justify-center p-2"><Loader2 className="animate-spin text-stone-400 h-5 w-5"/></div>
                                      ) : commentsData[post.id]?.length > 0 ? (
                                          commentsData[post.id].map(comment => (
                                              <div key={comment.id} className="space-y-2">
                                                  <CommentItem comment={comment} onReply={(name, id) => { setReplyTo({name, id}); }} />
                                                  {/* Replies (Level 2) */}
                                                  {comment.replies?.length > 0 && (
                                                      <div className="pl-10 space-y-2">
                                                          {comment.replies.map((reply: any) => (
                                                              <CommentItem key={reply.id} comment={reply} onReply={(name, id) => { setReplyTo({name, id: comment.id}); }} />
                                                          ))}
                                                      </div>
                                                  )}
                                              </div>
                                          ))
                                      ) : (
                                          <p className="text-xs text-stone-400 text-center py-2">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                                      )}
                                  </div>

                                  {/* Input Field (Thêm Avatar PRO của BẢN THÂN) */}
                                  <div className="flex gap-3 items-end pt-2 border-t border-stone-100 dark:border-stone-800 mt-2">
                                      <div className={cn("relative rounded-full p-0.5 shrink-0", isCurrentUserPro ? "bg-gradient-to-tr from-amber-400 to-yellow-600 shadow-sm" : "bg-transparent")}>
                                          <Avatar className="h-8 w-8 border border-white dark:border-stone-900">
                                              <AvatarImage src={session?.user?.image || ""} />
                                              <AvatarFallback>ME</AvatarFallback>
                                          </Avatar>
                                          {isCurrentUserPro && <div className="absolute -top-1 -right-1 bg-white dark:bg-stone-900 rounded-full p-0.5 shadow-sm"><Crown className="w-3 h-3 text-amber-500 fill-amber-500"/></div>}
                                      </div>

                                      <div className="flex-1 relative">
                                          {replyTo && (
                                              <div className="text-[10px] text-blue-600 mb-1 flex justify-between bg-blue-50 px-2 py-1 rounded">
                                                  <span>Đang trả lời <b>{replyTo.name}</b></span>
                                                  <button onClick={() => setReplyTo(null)} className="hover:underline">Hủy</button>
                                              </div>
                                          )}
                                          <div className="relative">
                                              <Input 
                                                value={commentContent}
                                                onChange={(e) => setCommentContent(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment(post.id)}
                                                placeholder={replyTo ? "Viết câu trả lời..." : "Viết bình luận..."} 
                                                className="pr-10 h-10 text-sm bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 rounded-2xl focus-visible:ring-amber-500"
                                                disabled={isCommenting}
                                              />
                                              <button onClick={() => handleSendComment(post.id)} disabled={isCommenting} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700 disabled:opacity-50">
                                                  {isCommenting ? <Loader2 size={16} className="animate-spin"/> : <Send size={16}/>}
                                              </button>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          )}
                       </CardFooter>
                     </Card>
                   )
                 })
                 : (
                   <div className="text-center py-20">
                      <p className="text-stone-500 font-medium">Chưa có bài viết nào.</p>
                   </div>
                 )}
              </div>
           </ScrollArea>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR */}
      <div className="w-80 border-l border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-[#12100e] shrink-0 hidden xl:flex flex-col">
         {/* ... (Giữ nguyên Right Sidebar) ... */}
         <div className="p-6 border-b border-stone-200 dark:border-stone-800 shrink-0">
            <h3 className="font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2 mb-4"><TrendingUp size={18} className="text-rose-500" /> Xu hướng tìm kiếm</h3>
            <div className="flex flex-wrap gap-2">{["#IELTS", "#ReactJS", "#THPTQG", "#CV", "#Intern"].map((tag, i) => <Badge key={i} variant="secondary" className="cursor-pointer hover:bg-amber-100 bg-stone-100 text-stone-600 border-0">{tag}</Badge>)}</div>
         </div>
      </div>
    </div>
  );
}