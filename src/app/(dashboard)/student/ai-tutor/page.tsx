"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { 
  Bot, Send, Mic, Paperclip, Image as ImageIcon, MoreHorizontal, 
  Sparkles, Plus, Search, Copy, ThumbsUp, 
  RotateCcw, Zap, Calculator, Code, 
  GraduationCap, Globe, ChevronRight, MessageSquare,
  Settings, User, FileText, FileSpreadsheet, Camera, UploadCloud,
  StopCircle, ChevronDown, ChevronUp as IconChevronUp
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- CONSTANTS ---
const AI_PERSONAS = [
  { id: "general", name: "EduTech Genious", role: "Trợ lý tổng hợp", icon: Bot, color: "bg-amber-500", desc: "Giải đáp mọi thắc mắc chung." },
  { id: "ielts", name: "Ms. Sarah (IELTS)", role: "Chuyên gia IELTS", icon: Globe, color: "bg-blue-500", desc: "Chấm Writing & Speaking." },
  { id: "math", name: "Prof. Newton", role: "Gia sư Toán", icon: Calculator, color: "bg-rose-500", desc: "Giải tích, Đại số, Hình học." },
  { id: "code", name: "Dev Senior", role: "Mentor Lập trình", icon: Code, color: "bg-emerald-500", desc: "Debug, Clean Code, Architecture." },
];

const CHAT_HISTORY = [
  { label: "Hôm nay", items: ["Giải thích React Hooks", "Chấm điểm bài Essay Task 2"] },
  { label: "Hôm qua", items: ["Lộ trình học Python", "Công thức đạo hàm"] },
];

// --- COMPONENT: TIN NHẮN CÓ THỂ RÚT GỌN ---
const MessageContent = ({ content, isUser }: { content: string, isUser: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 250; 
  const shouldTruncate = content.length > maxLength;

  if (!shouldTruncate) return <div className="whitespace-pre-wrap">{content}</div>;

  return (
    <div className="flex flex-col items-start">
      <div className="whitespace-pre-wrap">
        {isExpanded ? content : `${content.slice(0, maxLength)}...`}
      </div>
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "text-xs font-bold mt-2 flex items-center hover:underline",
          isUser ? "text-white/80 hover:text-white" : "text-amber-600 hover:text-amber-700"
        )}
      >
        {isExpanded ? <><IconChevronUp size={12} className="mr-1"/> Thu gọn</> : <><ChevronDown size={12} className="mr-1"/> Xem thêm</>}
      </button>
    </div>
  );
};

export default function AITutorPage() {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      role: "ai", 
      content: "Chào Tuấn Anh! 👋 Mình là **EduTech Genious**. Hôm nay bạn muốn mình giúp gì nào?", 
      time: "10:00 AM" 
    },
    {
      id: 2,
      role: "user",
      content: "Viết cho mình một lộ trình học IELTS từ 0 lên 6.5 trong 6 tháng.",
      time: "10:01 AM"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(AI_PERSONAS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Trạng thái đang xử lý để chặn spam
  const scrollViewportRef = useRef<HTMLDivElement>(null); 

  // Auto scroll
  useEffect(() => {
    if (scrollViewportRef.current) {
        const viewport = scrollViewportRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        } else {
             scrollViewportRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
        }
    }
  }, [messages, isRecording, isLoading]);

  const handleSendMessage = () => {
    // 1. Kiểm tra rỗng hoặc đang loading thì chặn luôn
    if (!inputValue.trim() || isLoading) return;
    
    setIsLoading(true); // Bắt đầu khóa nút gửi
    const userQuestion = inputValue;
    const newUserMsg = { id: Date.now(), role: "user", content: userQuestion, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    
    setMessages(prev => [...prev, newUserMsg]);
    setInputValue("");

    // Giả lập AI trả lời sau 1.5s
    setTimeout(() => {
      let aiContent = "";
      if (userQuestion.toLowerCase().includes("ielts") || userQuestion.toLowerCase().includes("writing")) {
         aiContent = `Tuyệt vời, đây là lộ trình IELTS Writing cho bạn:\n\n**Giai đoạn 1 (Tháng 1-2):** Nắm vững ngữ pháp cơ bản và các dạng câu phức. Tập viết câu đơn giản nhưng chính xác.\n\n**Giai đoạn 2 (Tháng 3-4):** Làm quen với các dạng bài Task 1 (Biểu đồ, Bản đồ) và Task 2 (Opinion, Discussion).\n\n**Giai đoạn 3 (Tháng 5-6):** Luyện đề Cambridge và chấm chữa chi tiết. Tập trung vào Coherence & Cohesion.`;
      } else {
         aiContent = `Mình đã nhận được câu hỏi: "${userQuestion}".\nĐang phân tích dữ liệu để đưa ra câu trả lời chính xác nhất cho bạn...`;
      }

      const newAiMsg = { 
        id: Date.now() + 1, 
        role: "ai", 
        content: aiContent, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
      };
      setMessages(prev => [...prev, newAiMsg]);
      setIsLoading(false); // Mở khóa nút gửi
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // FIX SPAM: Kiểm tra nếu đang gõ tiếng Việt (isComposing) thì không gửi
    if (e.nativeEvent.isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => { setIsRecording(false); setInputValue(prev => prev + " (Voice input...)"); }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    // CONTAINER: h-[calc(100vh-8rem)] để khớp màn hình, không cuộn body
    <div className="flex h-[calc(100vh-8rem)] w-full overflow-hidden bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl relative animate-in zoom-in-95 fade-in duration-500">
      
      {/* 1. LEFT SIDEBAR */}
      <div className={cn(
        "w-80 border-r border-stone-200 dark:border-stone-800 flex flex-col transition-all duration-300 bg-[#fdfbf7]/90 dark:bg-[#151311]/90 backdrop-blur-xl shrink-0 min-h-0",
        !isSidebarOpen && "w-0 opacity-0 overflow-hidden border-0"
      )}>
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-amber-700 dark:text-amber-500 font-black text-lg">
             <Bot className="fill-amber-500 text-amber-700" /> AI History
          </div>
        </div>
        <div className="p-4 shrink-0">
           <Button className="w-full justify-start gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 rounded-xl h-11 font-bold">
             <Plus size={18} /> Chat mới
           </Button>
        </div>
        <div className="px-4 pb-2 shrink-0">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input placeholder="Tìm kiếm..." className="pl-9 bg-white dark:bg-[#1c1917] border-stone-200 dark:border-stone-800 rounded-xl focus-visible:ring-amber-500" />
           </div>
        </div>
        <ScrollArea className="flex-1 px-3">
           <div className="space-y-6 py-4">
              {CHAT_HISTORY.map((group, idx) => (
                <div key={idx}>
                   <h4 className="px-3 text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">{group.label}</h4>
                   <div className="space-y-1">
                      {group.items.map((item, i) => (
                        <button key={i} className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-stone-600 dark:text-stone-300 hover:bg-white dark:hover:bg-stone-800 hover:shadow-sm transition-all flex items-center gap-2 group truncate">
                           <MessageSquare size={14} className="text-stone-400 group-hover:text-amber-500 shrink-0" />
                           <span className="truncate">{item}</span>
                        </button>
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </ScrollArea>
        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 shrink-0">
           <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-stone-200"><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>TA</AvatarFallback></Avatar>
              <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-stone-700 dark:text-stone-200 truncate">Tuấn Anh</p>
                 <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">PRO</Badge>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400"><Settings size={16}/></Button>
           </div>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0c0a09] min-w-0 min-h-0">
        
        {/* Header Cố Định */}
        <header className="h-16 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-md z-10 shrink-0">
           <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800">
                 {isSidebarOpen ? <ChevronRight /> : <MessageSquare />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-800 pl-1 pr-3 py-1 rounded-full cursor-pointer hover:bg-stone-200 transition-colors border border-transparent hover:border-amber-200">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${selectedPersona.color}`}>
                        <selectedPersona.icon size={16} />
                     </div>
                     <div>
                        <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{selectedPersona.name}</p>
                        <p className="text-[10px] text-stone-500 leading-none">{selectedPersona.role}</p>
                     </div>
                     <ChevronDown size={14} className="text-stone-400 ml-1" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                  <DropdownMenuLabel>Đổi nhân vật</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {AI_PERSONAS.map(p => (
                    <DropdownMenuItem key={p.id} onClick={() => setSelectedPersona(p)} className="gap-2 cursor-pointer">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${p.color} text-[10px]`}><p.icon size={12}/></div>
                      {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
           <div className="flex items-center gap-2">
              <Badge variant="outline" className="hidden md:flex bg-amber-50 text-amber-600 border-amber-200">GPT-4o Turbo</Badge>
              <Button variant="ghost" size="icon" className="text-stone-400 hover:text-amber-600"><RotateCcw size={18}/></Button>
           </div>
        </header>

        {/* --- KHU VỰC CHAT (SCROLL) --- */}
        <div className="flex-1 overflow-hidden relative" ref={scrollViewportRef}> 
           <ScrollArea className="h-full w-full px-4 sm:px-6">
              <div className="max-w-3xl mx-auto space-y-6 py-6 pb-4">
                 {messages.map((msg) => (
                   <div key={msg.id} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                      <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center shadow-sm shrink-0 mt-1",
                        msg.role === "ai" ? `${selectedPersona.color} text-white` : "bg-stone-200 dark:bg-stone-700"
                      )}>
                         {msg.role === "ai" ? <selectedPersona.icon size={20} /> : <User size={20} className="text-stone-500 dark:text-stone-300"/>}
                      </div>

                      <div className={cn(
                        "group relative max-w-[85%] rounded-2xl p-4 shadow-sm leading-relaxed text-sm md:text-base",
                        msg.role === "user" 
                          ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-none" 
                          : "bg-[#f5f5f4] dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 rounded-tl-none"
                      )}>
                         <div className={cn("flex items-center gap-2 mb-1 text-[10px] font-bold opacity-70", msg.role === "user" ? "justify-end text-amber-100" : "text-stone-500")}>
                            <span>{msg.role === "ai" ? selectedPersona.name : "Bạn"}</span>
                            <span>•</span>
                            <span>{msg.time}</span>
                         </div>

                         <MessageContent content={msg.content} isUser={msg.role === "user"} />

                         {msg.role === "ai" && (
                            <div className="absolute -bottom-8 left-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                               <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400 hover:text-amber-600"><Copy size={14}/></Button>
                               <Button variant="ghost" size="icon" className="h-7 w-7 text-stone-400 hover:text-emerald-600"><ThumbsUp size={14}/></Button>
                            </div>
                         )}
                      </div>
                   </div>
                 ))}
                 
                 {/* Loading Indicator */}
                 {isLoading && (
                   <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${selectedPersona.color} shadow-sm shrink-0`}>
                         <Bot size={20} className="animate-bounce" />
                      </div>
                      <div className="bg-[#f5f5f4] dark:bg-[#1c1917] border border-stone-200 dark:border-stone-800 rounded-2xl rounded-tl-none p-4 flex items-center gap-1">
                         <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                         <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                         <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
                      </div>
                   </div>
                 )}

                 {isRecording && (
                   <div className="flex justify-center items-center py-4">
                      <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full border border-red-200 animate-pulse">
                         <div className="w-2 h-2 bg-red-600 rounded-full animate-bounce"></div>
                         <span className="text-xs font-bold">Đang lắng nghe...</span>
                      </div>
                   </div>
                 )}
                 
                 <div className="h-4" /> 
              </div>
           </ScrollArea>
        </div>

        {/* Input Area (Cố định ở đáy) */}
        <div className="p-4 sm:p-6 bg-white dark:bg-[#0c0a09] shrink-0 z-20 border-t border-stone-100 dark:border-stone-800">
           <div className="max-w-3xl mx-auto bg-[#fcfaf8] dark:bg-[#151311] border-2 border-stone-200 dark:border-stone-700 rounded-3xl shadow-lg p-2 flex flex-col gap-2 relative focus-within:border-amber-500 transition-colors">
              <Textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown} // Dùng hàm xử lý riêng để chặn spam
                placeholder={isRecording ? "Đang ghi âm..." : isLoading ? "AI đang trả lời..." : `Nhắn tin cho ${selectedPersona.name}...`} 
                className="min-h-[50px] max-h-[150px] border-0 focus-visible:ring-0 bg-transparent resize-none text-base px-4 py-2 placeholder:text-stone-400 custom-scrollbar" 
                disabled={isRecording || isLoading} // Khóa khi đang loading
              />
              
              <div className="flex justify-between items-center px-2 pb-1">
                 <div className="flex gap-1">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800 rounded-full">
                          <Paperclip size={18}/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Đính kèm tệp</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2"><FileText size={16}/> Tài liệu Word/PDF</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2"><FileSpreadsheet size={16}/> Excel/Data</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800 rounded-full">
                          <ImageIcon size={18}/>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuLabel>Hình ảnh</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer gap-2"><UploadCloud size={16}/> Tải ảnh lên</DropdownMenuItem>
                        <DropdownMenuItem className="cursor-pointer gap-2"><Camera size={16}/> Chụp ảnh</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button 
                      onClick={toggleRecording}
                      variant="ghost" 
                      size="icon" 
                      className={cn(
                        "h-9 w-9 rounded-full transition-all",
                        isRecording ? "bg-red-100 text-red-600 hover:bg-red-200 animate-pulse" : "text-stone-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-stone-800"
                      )}
                    >
                      {isRecording ? <StopCircle size={20} /> : <Mic size={18} />}
                    </Button>
                 </div>
                 
                 <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputValue.trim()}
                    size="sm" 
                    className={cn(
                        "rounded-2xl px-5 h-9 font-bold shadow-md transition-all active:scale-95",
                        isLoading ? "bg-stone-300 text-stone-500 cursor-not-allowed" : "bg-amber-600 hover:bg-amber-700 text-white"
                    )}
                 >
                    {isLoading ? "..." : <>Gửi <Send size={14} className="ml-2" /></>}
                 </Button>
              </div>
           </div>
           <p className="text-center text-[10px] text-stone-400 mt-2">EduTech AI có thể mắc lỗi. Hãy kiểm tra lại thông tin quan trọng.</p>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR (TIPS) */}
      <div className="w-72 bg-[#fcfaf8] dark:bg-[#12100e] border-l border-stone-200 dark:border-stone-800 hidden xl:flex flex-col shrink-0 min-h-0 animate-in slide-in-from-right-20 fade-in duration-700 delay-200">
         <div className="p-5 border-b border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 shrink-0">
            <h3 className="font-black text-stone-800 dark:text-stone-200 text-lg">Trợ lý học tập</h3>
            <p className="text-xs text-stone-500 mt-1">Gợi ý thông minh dựa trên bài học</p>
         </div>

         <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
               <div>
                 <h4 className="px-1 text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Sparkles size={12} className="text-yellow-500"/> Gợi ý nhanh</h4>
                 <div className="space-y-2">
                    {["Viết dàn ý IELTS Task 2", "Giải thích code Python", "Tạo bài kiểm tra Toán", "Dịch thuật ngữ IT", "Tóm tắt bài văn", "Kiểm tra ngữ pháp"].map((prompt, i) => (
                      <Button key={i} variant="outline" className="w-full justify-start text-xs h-auto py-2 text-stone-600 dark:text-stone-400 bg-white dark:bg-[#1c1917] border-stone-200 dark:border-stone-800 hover:text-amber-600 hover:border-amber-300 whitespace-normal text-left">
                         {prompt}
                      </Button>
                    ))}
                 </div>
               </div>

               <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-900/30">
                  <h5 className="font-bold text-amber-800 dark:text-amber-500 text-sm mb-1 flex items-center gap-2"><Zap size={14}/> Pro Tip</h5>
                  <p className="text-xs text-amber-700/80 dark:text-amber-500/80 leading-relaxed">
                    Bạn có thể yêu cầu AI đóng vai người phỏng vấn để luyện tập kỹ năng Speaking.
                  </p>
               </div>
            </div>
         </ScrollArea>
         
         <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 shrink-0">
            <div className="flex items-center gap-3">
               <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg text-emerald-600">
                  <GraduationCap size={20} />
               </div>
               <div>
                  <p className="text-xs font-bold text-stone-800 dark:text-stone-300">Tiến độ tuần này</p>
                  <p className="text-[10px] text-stone-500">Bạn đã tương tác 45 lần.</p>
               </div>
            </div>
         </div>
      </div>

    </div>
  );
}