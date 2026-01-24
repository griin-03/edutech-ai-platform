"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem
} from "@/components/ui/dropdown-menu";
import { 
  Search, Filter, Download, Eye, Star, FileText, Globe, Code, 
  Calculator, Atom, BookOpen, Clock, Zap, CloudLightning, 
  ChevronDown, Layers, SortAsc
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- DUMMY DATA: KHO TÀNG ĐỀ THI ---
const LIBRARY_ITEMS = Array.from({ length: 20 }).map((_, i) => {
  const types = ["PDF", "Online Test", "DOCX"];
  const subjects = [
    { name: "IELTS", icon: Globe, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
    { name: "Math", icon: Calculator, color: "text-rose-500", bg: "bg-rose-50 dark:bg-rose-900/20" },
    { name: "Coding", icon: Code, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    { name: "Physics", icon: Atom, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
  ];
  const subj = subjects[i % subjects.length];
  
  return {
    id: i + 1,
    title: `${subj.name} Advanced Practice Test ${2024 + (i % 3)} - Set ${i + 1}`,
    subject: subj,
    type: types[i % 3],
    year: 2024 + (i % 3),
    downloads: (Math.random() * 5000 + 100).toFixed(0),
    views: (Math.random() * 10000 + 500).toFixed(0),
    rating: (4 + Math.random()).toFixed(1),
    pages: 10 + i * 2,
    size: `${(Math.random() * 5 + 1).toFixed(1)} MB`,
    isNew: i < 3
  };
});

export default function ExamLibraryPage() {
  const [searchTerm, setSearchTerm] = useState("");
  
  return (
    // CONTAINER CHÍNH: KHÓA CUỘN BODY
    <div className="flex h-[calc(100vh-8rem)] w-full flex-col overflow-hidden bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl relative">
      
      {/* --- 1. HEADER & TOOLBAR (CỐ ĐỊNH) --- */}
      <div className="shrink-0 p-6 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-md z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-black text-stone-800 dark:text-stone-100 flex items-center gap-2">
              <BookOpen className="text-amber-600" /> Thư viện Đề thi
            </h1>
            <p className="text-stone-500 text-sm font-medium mt-1">
              Kho tàng kiến thức vô tận. Hơn <span className="text-amber-600 font-bold">5,000+</span> đề thi chất lượng cao.
            </p>
          </div>
          <Button className="bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 hover:bg-amber-600 dark:hover:bg-amber-500 font-bold shadow-lg shadow-amber-500/20">
            <CloudLightning className="mr-2 h-4 w-4" /> Đóng góp đề thi
          </Button>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
            <Input 
              placeholder="Tìm kiếm theo tên đề, mã đề, môn học..." 
              className="pl-10 h-11 bg-stone-50 dark:bg-[#1c1917] border-stone-200 dark:border-stone-800 focus-visible:ring-amber-500 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="h-11 rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] text-stone-600 dark:text-stone-300">
                   <Filter className="mr-2 h-4 w-4" /> Môn học
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent><DropdownMenuItem>Toán</DropdownMenuItem><DropdownMenuItem>Lý</DropdownMenuItem><DropdownMenuItem>Anh</DropdownMenuItem></DropdownMenuContent>
             </DropdownMenu>

             <DropdownMenu>
               <DropdownMenuTrigger asChild>
                 <Button variant="outline" className="h-11 rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] text-stone-600 dark:text-stone-300">
                   <Layers className="mr-2 h-4 w-4" /> Định dạng
                 </Button>
               </DropdownMenuTrigger>
               <DropdownMenuContent><DropdownMenuItem>PDF</DropdownMenuItem><DropdownMenuItem>Word</DropdownMenuItem><DropdownMenuItem>Online Test</DropdownMenuItem></DropdownMenuContent>
             </DropdownMenu>

             <Button variant="outline" className="h-11 w-11 p-0 rounded-xl border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917]">
               <SortAsc className="h-4 w-4 text-stone-500" />
             </Button>
          </div>
        </div>
      </div>

      {/* --- 2. MAIN CONTENT (SCROLLABLE AREA) --- */}
      <div className="flex-1 min-h-0 relative">
        <ScrollArea className="h-full px-6 custom-scrollbar">
          <div className="py-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            
            {LIBRARY_ITEMS.map((item, index) => (
              <Card 
                key={item.id} 
                className="group relative overflow-hidden border-stone-200 dark:border-stone-800 bg-white dark:bg-[#1c1917] hover:shadow-xl hover:shadow-amber-900/5 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-500 rounded-2xl animate-in fade-in slide-in-from-bottom-10 fill-mode-forwards"
                style={{ animationDelay: `${index * 50}ms` }} // HIỆU ỨNG TRIỆU HỒI STAGGER
              >
                {/* New Badge */}
                {item.isNew && (
                  <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-bl-lg z-10 shadow-sm">
                    NEW
                  </div>
                )}

                <CardHeader className="pb-3 pt-5 px-5">
                  <div className="flex justify-between items-start mb-3">
                    <div className={`p-2.5 rounded-xl ${item.subject.bg} transition-transform group-hover:scale-110 duration-300`}>
                      <item.subject.icon size={20} className={item.subject.color} />
                    </div>
                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider text-stone-500 border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800">
                      {item.type}
                    </Badge>
                  </div>
                  
                  <div className="min-h-[3.5rem]">
                    <CardTitle className="text-base font-bold text-stone-800 dark:text-stone-100 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                      {item.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="px-5 pb-4">
                  <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
                    <span className="flex items-center gap-1"><Download size={12}/> {item.downloads}</span>
                    <span className="flex items-center gap-1"><Eye size={12}/> {item.views}</span>
                    <span className="flex items-center gap-1 text-amber-500"><Star size={12} className="fill-amber-500"/> {item.rating}</span>
                  </div>
                  
                  <div className="mt-4 flex items-center gap-2 text-[10px] text-stone-400 bg-stone-50 dark:bg-stone-800/50 p-2 rounded-lg">
                    <FileText size={12} /> {item.pages} trang • {item.size} • Năm {item.year}
                  </div>
                </CardContent>

                <CardFooter className="px-5 pb-5 pt-0 flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 h-9 text-xs font-bold border-stone-200 dark:border-stone-700 hover:text-amber-600 hover:border-amber-200 dark:text-stone-300">
                    <Eye size={14} className="mr-1.5" /> Xem trước
                  </Button>
                  <Button size="sm" className="flex-1 h-9 text-xs font-bold bg-stone-900 dark:bg-white text-white dark:text-stone-900 hover:bg-amber-600 dark:hover:bg-amber-400 shadow-md">
                    <Download size={14} className="mr-1.5" /> Tải về
                  </Button>
                </CardFooter>
              </Card>
            ))}

          </div>
          {/* Spacer bottom để không bị che bởi viền màn hình */}
          <div className="h-10"></div>
        </ScrollArea>
      </div>

    </div>
  );
}