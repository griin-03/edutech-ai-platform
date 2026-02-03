"use client";

import { useEffect, useState } from "react";
import { getTeacherReviews, replyToReview } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, MessageCircle, Reply, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function ReviewsManagerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // State quản lý việc trả lời
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getTeacherReviews();
    setData(res);
    setLoading(false);
  };

  const handleSubmitReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    
    const res = await replyToReview(reviewId, replyText);
    if (res.success) {
      toast.success(res.message);
      setReplyingId(null);
      setReplyText("");
      loadData(); // Reload lại dữ liệu
    } else {
      toast.error(res.message);
    }
    setIsSubmitting(false);
  };

  // Render Ngôi sao
  const renderStars = (count: number) => (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star 
          key={star} 
          className={`w-4 h-4 ${star <= count ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} 
        />
      ))}
    </div>
  );

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-violet-600" /></div>;

  const { reviews, stat } = data;
  const unrepliedReviews = reviews.filter((r: any) => !r.reply);

  return (
    <div className="p-8 space-y-8 bg-slate-50 min-h-screen animate-in fade-in">
      
      {/* 1. HEADER & KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Điểm trung bình to bự */}
        <Card className="bg-violet-600 text-white border-none shadow-lg lg:col-span-1 flex flex-col justify-center items-center text-center p-6">
          <div className="text-6xl font-bold">{stat?.avgRating}</div>
          <div className="flex gap-1 my-2 justify-center">
            {[1,2,3,4,5].map(s => <Star key={s} className="fill-white text-white w-5 h-5" />)}
          </div>
          <p className="text-violet-100 mt-2">{stat?.total} đánh giá tổng cộng</p>
        </Card>

        {/* Biểu đồ phân bố sao */}
        <Card className="lg:col-span-3 border-none shadow-sm">
          <CardHeader className="pb-2"><CardTitle>Phân bố chất lượng</CardTitle></CardHeader>
          <CardContent className="space-y-3">
             {[5, 4, 3, 2, 1].map((star, idx) => {
               const count = stat?.distribution[idx];
               const percent = stat?.total > 0 ? (count / stat?.total) * 100 : 0;
               return (
                 <div key={star} className="flex items-center gap-4 text-sm">
                   <span className="font-bold w-3">{star}</span>
                   <Progress value={percent} className="h-2.5 bg-slate-100" />
                   <span className="text-slate-500 w-10 text-right">{count}</span>
                 </div>
               )
             })}
          </CardContent>
        </Card>
      </div>

      {/* 2. DANH SÁCH REVIEW & TRẢ LỜI */}
      <div className="space-y-4">
        <Tabs defaultValue="all" className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">Tất cả ({reviews.length})</TabsTrigger>
              <TabsTrigger value="unreplied" className="text-orange-600">
                 Cần trả lời ({unrepliedReviews.length})
              </TabsTrigger>
            </TabsList>
            
            <div className="text-sm text-slate-500 flex items-center gap-2">
               Tỷ lệ phản hồi: 
               <span className={`font-bold ${stat.responseRate > 80 ? 'text-green-600' : 'text-orange-500'}`}>
                 {stat.responseRate}%
               </span>
            </div>
          </div>

          {/* COMPONENT HIỂN THỊ LIST REVIEW */}
          {["all", "unreplied"].map((tabVal) => (
            <TabsContent key={tabVal} value={tabVal} className="space-y-4">
              {(tabVal === "all" ? reviews : unrepliedReviews).length === 0 ? (
                <div className="text-center py-12 text-slate-400 bg-white rounded-lg border border-dashed">
                   Tuyệt vời! Không có đánh giá nào cần xử lý.
                </div>
              ) : (
                (tabVal === "all" ? reviews : unrepliedReviews).map((review: any) => (
                  <Card key={review.id} className="overflow-hidden border-none shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={review.user.avatar} />
                          <AvatarFallback>{review.user.name[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-slate-800">{review.user.name}</div>
                              <div className="text-xs text-slate-500">{review.course.title}</div>
                            </div>
                            <span className="text-xs text-slate-400">
                              {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true, locale: vi })}
                            </span>
                          </div>

                          {renderStars(review.rating)}

                          <p className="text-slate-700 bg-slate-50 p-3 rounded-md text-sm leading-relaxed">
                            {review.comment || "Không có nội dung."}
                          </p>

                          {/* KHU VỰC TRẢ LỜI (LOGIC QUAN TRỌNG) */}
                          <div className="pt-2">
                            {review.reply ? (
                              // 1. Đã trả lời -> Hiện nội dung
                              <div className="flex gap-3 ml-4 mt-2 border-l-2 border-violet-300 pl-4 py-2">
                                 <Avatar className="h-8 w-8">
                                    <AvatarFallback className="bg-violet-100 text-violet-700">GV</AvatarFallback>
                                 </Avatar>
                                 <div className="space-y-1">
                                    <div className="text-xs font-bold text-violet-700 flex items-center gap-1">
                                       Giảng viên phản hồi <CheckCircle2 className="w-3 h-3" />
                                    </div>
                                    <p className="text-sm text-slate-600">{review.reply}</p>
                                    <div className="text-[10px] text-slate-400">
                                       {formatDistanceToNow(new Date(review.repliedAt), { addSuffix: true, locale: vi })}
                                    </div>
                                 </div>
                              </div>
                            ) : (
                              // 2. Chưa trả lời -> Hiện nút/form
                              replyingId === review.id ? (
                                <div className="mt-4 animate-in slide-in-from-top-2">
                                  <Textarea 
                                    placeholder="Nhập câu trả lời của bạn..." 
                                    className="mb-2"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    autoFocus
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button variant="ghost" size="sm" onClick={() => setReplyingId(null)}>Hủy</Button>
                                    <Button 
                                      size="sm" 
                                      className="bg-violet-600 hover:bg-violet-700"
                                      onClick={() => handleSubmitReply(review.id)}
                                      disabled={isSubmitting}
                                    >
                                      {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : "Gửi phản hồi"}
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="text-violet-600 border-violet-200 hover:bg-violet-50"
                                  onClick={() => {
                                    setReplyingId(review.id);
                                    setReplyText(`Chào ${review.user.name}, cảm ơn bạn đã đánh giá! `);
                                  }}
                                >
                                  <Reply className="w-4 h-4 mr-2" /> Trả lời
                                </Button>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}