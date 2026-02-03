"use client";

import { useEffect, useState } from "react";
import { getTeacherReviews } from "./actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress"; // Nhớ cài component này hoặc dùng div width%
import { Star, MessageSquare, Quote } from "lucide-react";
import { Loader2 } from "lucide-react";

export default function ReviewsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeacherReviews().then((res) => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-violet-600" /></div>;

  const { reviews, summary } = data;

  // Hàm render ngôi sao vàng
  const renderStars = (rating: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-slate-300"}`} 
      />
    ));
  };

  return (
    <div className="p-8 space-y-6 bg-slate-50 min-h-screen">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Đánh giá từ Học viên</h1>
        <p className="text-slate-500">Xem phản hồi về chất lượng giảng dạy của bạn.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CỘT 1: TỔNG QUAN ĐIỂM SỐ */}
        <Card className="h-fit shadow-md border-none lg:col-span-1">
          <CardHeader>
            <CardTitle>Tổng quan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center p-6 bg-violet-50 rounded-xl">
              <div className="text-5xl font-bold text-violet-700">{summary.avg}</div>
              <div className="flex justify-center gap-1 my-2">
                 {renderStars(Math.round(Number(summary.avg)))}
              </div>
              <div className="text-slate-500 text-sm">{summary.total} đánh giá tổng cộng</div>
            </div>

            {/* Thanh tiến trình từng sao */}
            <div className="space-y-3">
              {[5, 4, 3, 2, 1].map((star, index) => {
                const count = summary.starCounts[index]; // Do lúc action ta đã reverse
                const percent = summary.total > 0 ? (count / summary.total) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center gap-3 text-sm">
                    <div className="flex items-center gap-1 w-12 font-medium">
                      {star} <Star className="w-3 h-3 text-slate-400" />
                    </div>
                    <Progress value={percent} className="h-2" />
                    <div className="w-8 text-right text-slate-500">{count}</div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* CỘT 2: DANH SÁCH REVIEW */}
        <Card className="shadow-md border-none lg:col-span-2">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5" /> Đánh giá gần đây
             </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {reviews.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                Chưa có đánh giá nào cho các khóa học của bạn.
              </div>
            ) : (
              reviews.map((review: any) => (
                <div key={review.id} className="flex gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors border-b last:border-0">
                  {/* Avatar User */}
                  <Avatar className="w-10 h-10 border">
                    <AvatarImage src={review.user.avatar} />
                    <AvatarFallback>{review.user.name?.[0]}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900">{review.user.name}</div>
                        <div className="text-xs text-slate-500">{review.course.title}</div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>

                    {/* Số sao */}
                    <div className="flex gap-0.5 py-1">
                      {renderStars(review.rating)}
                    </div>

                    {/* Nội dung comment */}
                    <div className="text-slate-700 text-sm leading-relaxed bg-white p-3 rounded border border-slate-100 mt-2 relative">
                        <Quote className="w-4 h-4 text-slate-200 absolute top-2 right-2" />
                        {review.comment || "Người dùng không viết nhận xét."}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}