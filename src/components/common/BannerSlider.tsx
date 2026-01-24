"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight, Sparkles } from "lucide-react";

const SLIDES = [
  {
    id: 1,
    title: "IELTS Intensive 2026",
    desc: "Luyện Reading & Listening chuẩn format Cambridge với AI.",
    bg: "bg-gradient-to-r from-amber-600 to-orange-600",
    pattern: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%)"
  },
  {
    id: 2,
    title: "Writing Task 2 Masterclass",
    desc: "Chấm chữa bài tự động, gợi ý từ vựng band 8.0+.",
    bg: "bg-gradient-to-r from-stone-600 to-stone-500",
    pattern: "linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%)"
  },
  {
    id: 3,
    title: "English for IT Professionals",
    desc: "Tiếng Anh chuyên ngành cho lập trình viên.",
    bg: "bg-gradient-to-r from-emerald-600 to-teal-600",
    pattern: "radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15) 0%, transparent 40%)"
  }
];

export function BannerSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    // FIX: Dùng h-full w-full absolute để lấp đầy khung cha
    <div className="absolute inset-0 h-full w-full group">
      {SLIDES.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out flex items-center px-10 ${
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          } ${slide.bg}`}
          style={{ backgroundImage: `${slide.bg}, ${slide.pattern}` }}
        >
          <div className="max-w-xl space-y-4 translate-y-4 animate-in slide-in-from-bottom-5 fade-in duration-700">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md border border-white/20">
              <Sparkles size={12} className="text-yellow-300" /> New Course
            </div>
            <h2 className="text-4xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md">
              {slide.title}
            </h2>
            <p className="text-white/90 text-lg font-medium">{slide.desc}</p>
            <Button className="bg-white text-stone-900 hover:bg-stone-100 font-bold border-0 shadow-xl mt-4 rounded-full px-8">
              Học thử ngay <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      
      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`h-2 rounded-full transition-all duration-300 shadow-sm ${
              idx === current ? "w-8 bg-white" : "w-2 bg-white/40 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}