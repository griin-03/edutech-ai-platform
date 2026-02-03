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
  HelpCircle, Flame, ChevronLeft, ChevronRight, Loader2, Send, CornerDownRight
} from "lucide-react";
import { cn } from "@/lib/utils";

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
const CommentItem = ({ comment, onReply }: { comment: any, onReply: (user: string, id: string) => void }) => (
    <div className="flex gap-3 text-sm group">
        <Avatar className="h-8 w-8 mt-1">
            <AvatarImage src={comment.user?.avatar} />
            <AvatarFallback>{comment.user?.name?.[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
            <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl px-3 py-2 w-fit">
                <p className="font-bold text-stone-800 dark:text-stone-200 text-xs">{comment.user?.name}</p>
                <p className="text-stone-600 dark:text-stone-300 mt-0.5">{comment.content}</p>
            </div>
            <div className="flex gap-3 mt-1 ml-2">
                <button className="text-[10px] font-bold text-stone-500 hover:text-amber-600 cursor-pointer">Thích</button>
                <button 
                    onClick={() => onReply(comment.user?.name, comment.id)} // Truyền ID cha để trả lời
                    className="text-[10px] font-bold text-stone-500 hover:text-amber-600 cursor-pointer"
                >
                    Trả lời
                </button>
                <span className="text-[10px] text-stone-400">{new Date(comment.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            </div>
        </div>
    </div>
);

export default function CommunityPage() {
  const { data: session } = useSession();
  
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

  // STATE BÌNH LUẬN (QUAN TRỌNG)
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null); // Bài viết đang mở comment
  const [commentsData, setCommentsData] = useState<Record<string, any[]>>({}); // Cache comment theo postId
  const [commentsLoading, setCommentsLoading] = useState<Record<string, boolean>>({});
  
  const [commentContent, setCommentContent] = useState("");
  const [replyTo, setReplyTo] = useState<{name: string, id: string} | null>(null); // Đang trả lời ai?
  const [isCommenting, setIsCommenting] = useState(false);

  // 1. FETCH BÀI VIẾT
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

  // 2. FETCH BÌNH LUẬN (Khi bấm mở)
  const loadComments = async (postId: string) => {
      if (activeCommentPostId === postId) {
          setActiveCommentPostId(null); // Đóng nếu đang mở
          return;
      }
      setActiveCommentPostId(postId);
      setReplyTo(null); // Reset reply state
      
      // Nếu chưa có data thì mới fetch
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

  // 3. GỬI BÌNH LUẬN / TRẢ LỜI
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
                parentId: replyTo?.id || null // Gửi kèm ID cha nếu đang trả lời
            })
        });
        
        const newComment = await res.json();
        if (newComment.id) {
            // Cập nhật UI ngay lập tức
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p));
            
            // Thêm comment vào list
            setCommentsData(prev => {
                const currentComments = prev[postId] || [];
                if (replyTo?.id) {
                    // Nếu là reply, tìm cha và push vào mảng replies của nó
                    return {
                        ...prev,
                        [postId]: currentComments.map(c => c.id === replyTo.id ? {...c, replies: [...(c.replies || []), newComment]} : c)
                    };
                } else {
                    // Nếu là comment gốc, push lên đầu
                    return {...prev, [postId]: [newComment, ...currentComments]};
                }
            });

            setCommentContent("");
            setReplyTo(null);
        }
    } catch (e) { console.error(e); } 
    finally { setIsCommenting(false); }
  };

  // CÁC HÀM KHÁC (LIKE, POST...)
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
            fetchPosts(); // Reload lại feed
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
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl relative">
      
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
        <div className="mt-auto p-6 shrink-0">
           <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 whitespace-nowrap overflow-hidden">
              <p className="font-bold text-sm mb-1">Tham gia Premium</p>
              <p className="text-xs opacity-90 mb-3">Đăng bài không giới hạn.</p>
              <Button size="sm" variant="secondary" className="w-full text-xs font-bold text-amber-700">Nâng cấp ngay</Button>
           </div>
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
                 : displayedPosts.length > 0 ? displayedPosts.map((post, index) => (
                     <Card key={post.id} className="border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-lg transition-all">
                       <CardHeader className="flex flex-row items-start justify-between pb-3 p-4 sm:p-6">
                          <div className="flex gap-3">
                             <Avatar><AvatarImage src={post.user?.avatar} /><AvatarFallback>{post.user?.name?.[0]}</AvatarFallback></Avatar>
                             <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                   <h4 className="font-bold text-sm text-stone-800 dark:text-stone-100">{post.user?.name}</h4>
                                   <Badge variant="secondary" className="text-[10px] h-5 px-1.5 bg-stone-100 text-stone-500">{post.user?.role || "Member"}</Badge>
                                </div>
                                <p className="text-xs text-stone-400 mt-0.5">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</p>
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

                                  {/* Input Field */}
                                  <div className="flex gap-3 items-end">
                                      <Avatar className="h-8 w-8"><AvatarImage src={session?.user?.image || ""} /><AvatarFallback>ME</AvatarFallback></Avatar>
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
                                                className="pr-10 h-10 text-sm bg-stone-50 rounded-2xl"
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
                   ))
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