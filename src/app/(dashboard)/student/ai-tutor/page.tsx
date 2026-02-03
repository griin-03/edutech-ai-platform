"use client";

import { useState, useEffect, useRef } from "react";
import { SessionProvider, useSession } from "next-auth/react"; 
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
// --- ĐÃ THÊM IMPORT CÒN THIẾU Ở ĐÂY ---
import { 
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger 
} from "@/components/ui/tooltip";
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuRadioGroup, DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import { 
  Bot, Send, Mic, Paperclip, Image as ImageIcon, MoreHorizontal, 
  Sparkles, Plus, Search, Copy, ThumbsUp, 
  RotateCcw, Zap, Calculator, Code, 
  GraduationCap, Globe, ChevronRight, MessageSquare,
  Settings, User, FileText, FileSpreadsheet, Camera, UploadCloud,
  StopCircle, ChevronDown, ChevronUp as IconChevronUp, LogOut, UserCircle, Crown, PanelRightClose, PanelRightOpen, X, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import Link from "next/link";

// --- CONSTANTS ---
const AI_PERSONAS = [
  { id: "general", name: "EduTech Genious", role: "Trợ lý tổng hợp", icon: Bot, color: "bg-amber-500", desc: "Giải đáp mọi thắc mắc chung." },
  { id: "ielts", name: "Ms. Sarah (IELTS)", role: "Chuyên gia IELTS", icon: Globe, color: "bg-blue-500", desc: "Chấm Writing & Speaking." },
  { id: "math", name: "Prof. Newton", role: "Gia sư Toán", icon: Calculator, color: "bg-rose-500", desc: "Giải tích, Đại số, Hình học." },
  { id: "code", name: "Dev Senior", role: "Mentor Lập trình", icon: Code, color: "bg-emerald-500", desc: "Debug, Clean Code, Architecture." },
];

const AI_MODELS = [
    { id: "standard", name: "Flash (Free)", desc: "Nhanh, cơ bản", icon: Zap },
    { id: "pro", name: "Pro (GPT-4)", desc: "Thông minh, sâu sắc", icon: Crown },
];

// --- COMPONENT CON: RÚT GỌN TIN NHẮN ---
const MessageContent = ({ content, isUser }: { content: string, isUser: boolean }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 300; 
  const shouldTruncate = content.length > maxLength;

  if (!shouldTruncate) return <div className="whitespace-pre-wrap">{content}</div>;

  return (
    <div className="flex flex-col items-start w-full">
      <div className="whitespace-pre-wrap break-words w-full">
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

// --- COMPONENT CHÍNH (LOGIC) ---
function AITutorContent() {
  const { data: session } = useSession();
  
  // STATE DỮ LIỆU
  const [messages, setMessages] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // STATE UI
  const [inputValue, setInputValue] = useState("");
  const [selectedPersona, setSelectedPersona] = useState(AI_PERSONAS[0]);
  const [selectedModel, setSelectedModel] = useState("standard"); // Chọn model AI
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true); // Toggle thanh bên phải
  const [isLoading, setIsLoading] = useState(false);
  
  // STATE FEATURE (Mic, File)
  const [isRecording, setIsRecording] = useState(false);
  const [attachment, setAttachment] = useState<File | null>(null); // File đính kèm

  // REFS
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Input file ẩn

  // 1. LOAD LỊCH SỬ
  useEffect(() => { fetchSessions(); }, []);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/ai/chat?action=GET_SESSIONS");
      const data = await res.json();
      if (Array.isArray(data)) setSessions(data);
    } catch (e) { console.error(e); }
  };

  const loadSession = async (sessionId: string) => {
    if (sessionId === currentSessionId) return;
    setIsLoading(true);
    setCurrentSessionId(sessionId);
    try {
      const res = await fetch(`/api/ai/chat?action=GET_MESSAGES&sessionId=${sessionId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMessages(data.map((m: any) => ({
          id: m.id, role: m.role === "user" ? "user" : "ai",
          content: m.content, time: new Date(m.createdAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})
        })));
      }
    } catch (e) { console.error(e); }
    setIsLoading(false);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleNewChat = () => {
    setMessages([{ 
        id: "welcome", role: "ai", 
        content: `Chào ${session?.user?.name || "bạn"}! 👋 Mình là **${selectedPersona.name}**. Hôm nay bạn muốn mình giúp gì nào?`, 
        time: "Now"
    }]);
    setCurrentSessionId(null);
    setAttachment(null);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  // 2. GỬI TIN NHẮN (XỬ LÝ CẢ FILE)
  const handleSendMessage = async () => {
    if ((!inputValue.trim() && !attachment) || isLoading) return;
    
    let userContent = inputValue;
    if (attachment) userContent += `\n[Đã đính kèm file: ${attachment.name}]`; // Giả lập gửi file

    setInputValue("");
    setAttachment(null); // Reset file
    setIsLoading(true);

    // Optimistic UI
    const tempMsg = { id: Date.now(), role: "user", content: userContent, time: "Now" };
    setMessages(prev => [...prev, tempMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        body: JSON.stringify({
           message: userContent,
           sessionId: currentSessionId,
           persona: selectedPersona.id,
           model: selectedModel // Gửi model lên server (để sau này tính tiền Pro)
        })
      });
      const data = await res.json();
      
      if (data.reply) {
         if (!currentSessionId && data.sessionId) {
            setCurrentSessionId(data.sessionId);
            fetchSessions();
         }
         const aiMsg = { id: Date.now() + 1, role: "ai", content: data.reply, time: "Now" };
         setMessages(prev => [...prev, aiMsg]);
         fetchSessions(); // Cập nhật thứ tự history
      }
    } catch (e) {
       setMessages(prev => [...prev, { id: Date.now(), role: "ai", content: "⚠️ Lỗi kết nối.", time: "Now" }]);
    } finally {
       setIsLoading(false);
    }
  };

  // 3. XỬ LÝ GHI ÂM (REAL 100% WEB API)
  const toggleRecording = () => {
    if (isRecording) {
        setIsRecording(false);
        return; // Dừng (trình duyệt tự handle onend)
    }

    // Kiểm tra trình duyệt hỗ trợ
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
        alert("Trình duyệt của bạn không hỗ trợ ghi âm. Hãy thử Chrome/Edge.");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'vi-VN'; // Set tiếng Việt
    recognition.continuous = false;
    
    recognition.onstart = () => setIsRecording(true);
    
    recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + " " + transcript);
    };

    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  // 4. XỬ LÝ FILE (REAL UI)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        setAttachment(e.target.files[0]);
    }
  };

  // Auto Scroll
  useEffect(() => {
    if (scrollViewportRef.current) {
        const viewport = scrollViewportRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) viewport.scrollTop = viewport.scrollHeight;
        else scrollViewportRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, isLoading, attachment]);

  return (
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
           <Button onClick={handleNewChat} className="w-full justify-start gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/20 rounded-xl h-11 font-bold">
             <Plus size={18} /> Chat mới
           </Button>
        </div>
        <div className="px-4 pb-2 shrink-0">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input placeholder="Tìm kiếm..." className="pl-9 bg-white rounded-xl focus-visible:ring-amber-500" />
           </div>
        </div>
        
        <ScrollArea className="flex-1 px-3">
           <div className="space-y-2 py-4">
              {sessions.length === 0 ? (
                  <div className="text-center text-stone-400 text-xs mt-10">Chưa có lịch sử chat</div>
              ) : (
                  sessions.map((sess) => (
                    <button key={sess.id} onClick={() => loadSession(sess.id)}
                        className={cn("w-full text-left px-3 py-3 rounded-lg text-sm transition-all flex items-center gap-3 group truncate border border-transparent",
                            currentSessionId === sess.id ? "bg-white shadow-sm border-stone-200 font-bold text-amber-700" : "text-stone-600 hover:bg-white/50"
                        )}>
                       <MessageSquare size={16} className={cn("shrink-0", currentSessionId === sess.id ? "text-amber-500" : "text-stone-300")} />
                       <div className="truncate flex-1">
                           <p className="truncate">{sess.title}</p>
                           <p className="text-[10px] text-stone-400 opacity-70 mt-0.5">{new Date(sess.updatedAt).toLocaleDateString('vi-VN')}</p>
                       </div>
                    </button>
                  ))
              )}
           </div>
        </ScrollArea>
        {/* User Info */}
        <div className="p-4 border-t border-stone-200 bg-white/50 shrink-0">
           <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 border border-stone-200">
                  <AvatarImage src={session?.user?.image || ""} />
                  <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{session?.user?.name?.charAt(0)||"U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 overflow-hidden">
                 <p className="text-sm font-bold text-stone-700 truncate">{session?.user?.name || "Học viên"}</p>
                 <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700 border-0">PRO</Badge>
              </div>
              <DropdownMenu>
                  <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8 text-stone-400 rounded-full"><Settings size={16}/></Button></DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuLabel>Tài khoản của tôi</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem><UserCircle className="mr-2 h-4 w-4" /> Hồ sơ cá nhân</DropdownMenuItem>
                      <DropdownMenuItem><Zap className="mr-2 h-4 w-4" /> Nâng cấp PRO</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600" onClick={() => signOut()}><LogOut className="mr-2 h-4 w-4" /> Đăng xuất</DropdownMenuItem>
                  </DropdownMenuContent>
              </DropdownMenu>
           </div>
        </div>
      </div>

      {/* 2. MAIN CHAT AREA */}
      <div className="flex-1 flex flex-col relative bg-white dark:bg-[#0c0a09] min-w-0 min-h-0">
        
        {/* Header */}
        <header className="h-16 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between px-6 bg-white/80 backdrop-blur-md z-10 shrink-0">
           <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-stone-500">
                 {isSidebarOpen ? <ChevronRight /> : <MessageSquare />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-2 bg-stone-100 pl-1 pr-3 py-1 rounded-full cursor-pointer hover:bg-stone-200 transition-colors border border-transparent hover:border-amber-200">
                     <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white ${selectedPersona.color}`}><selectedPersona.icon size={16} /></div>
                     <div><p className="text-sm font-bold text-stone-800">{selectedPersona.name}</p></div>
                     <ChevronDown size={14} className="text-stone-400 ml-1" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-60">
                  <DropdownMenuLabel>Đổi nhân vật</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {AI_PERSONAS.map(p => (
                    <DropdownMenuItem key={p.id} onClick={() => setSelectedPersona(p)} className="gap-2 cursor-pointer">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-white ${p.color} text-[10px]`}><p.icon size={12}/></div> {p.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
           </div>
           
           {/* Model Selector (Standard vs PRO) */}
           <div className="flex items-center gap-2">
              <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-all border", selectedModel === 'pro' ? "bg-stone-900 text-white border-stone-900" : "bg-white text-stone-600 border-stone-200")}>
                        {selectedModel === 'pro' ? <Crown size={14} className="text-amber-400"/> : <Zap size={14}/>}
                        <span className="text-xs font-bold">{selectedModel === 'pro' ? "Pro Model" : "Standard"}</span>
                        <ChevronDown size={12}/>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Chọn mô hình AI</DropdownMenuLabel>
                      <DropdownMenuSeparator/>
                      <DropdownMenuRadioGroup value={selectedModel} onValueChange={setSelectedModel}>
                          {AI_MODELS.map(m => (
                              <DropdownMenuRadioItem key={m.id} value={m.id} className="cursor-pointer">
                                  <div className="flex items-center gap-2">
                                      <m.icon size={14} className={m.id === 'pro' ? "text-amber-500" : "text-stone-400"}/>
                                      <div>
                                          <p className="font-bold">{m.name}</p>
                                          <p className="text-[10px] text-stone-400">{m.desc}</p>
                                      </div>
                                  </div>
                              </DropdownMenuRadioItem>
                          ))}
                      </DropdownMenuRadioGroup>
                  </DropdownMenuContent>
              </DropdownMenu>

              <Button variant="ghost" size="icon" onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="text-stone-400 hover:text-amber-600">
                  {isRightSidebarOpen ? <PanelRightClose size={18}/> : <PanelRightOpen size={18}/>}
              </Button>
           </div>
        </header>

        {/* Chat Scroll */}
        <div className="flex-1 overflow-hidden relative" ref={scrollViewportRef}> 
           <ScrollArea className="h-full w-full px-4 sm:px-6">
              <div className="max-w-3xl mx-auto space-y-6 py-6 pb-4">
                 {messages.length === 0 && !isLoading ? (
                     <div className="flex flex-col items-center justify-center h-[50vh] text-stone-400 animate-in fade-in zoom-in-95 duration-500">
                         <div className={`h-20 w-20 rounded-3xl flex items-center justify-center text-white mb-6 shadow-xl ${selectedPersona.color}`}><selectedPersona.icon size={40} /></div>
                         <h3 className="text-xl font-bold text-stone-700">Xin chào, {session?.user?.name || "Bạn"}!</h3>
                         <p className="max-w-md text-center mt-2">Mình là <span className="font-bold text-amber-600">{selectedPersona.name}</span>. {selectedPersona.desc}</p>
                     </div>
                 ) : (
                     messages.map((msg) => (
                       <div key={msg.id} className={cn("flex gap-4 animate-in fade-in slide-in-from-bottom-2", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
                          <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shadow-sm shrink-0 mt-1", msg.role === "ai" ? `${selectedPersona.color} text-white` : "bg-stone-200")}>
                             {msg.role === "ai" ? <selectedPersona.icon size={20} /> : <User size={20} className="text-stone-500"/>}
                          </div>
                          <div className={cn("group relative max-w-[85%] rounded-2xl p-4 shadow-sm leading-relaxed text-sm md:text-base", msg.role === "user" ? "bg-gradient-to-br from-amber-500 to-orange-600 text-white rounded-tr-none" : "bg-[#f5f5f4] border border-stone-200 text-stone-800 rounded-tl-none")}>
                             <div className={cn("flex items-center gap-2 mb-1 text-[10px] font-bold opacity-70", msg.role === "user" ? "justify-end text-amber-100" : "text-stone-500")}>
                                <span>{msg.role === "ai" ? selectedPersona.name : "Bạn"}</span> • <span>{msg.time}</span>
                             </div>
                             <MessageContent content={msg.content} isUser={msg.role === "user"} />
                          </div>
                       </div>
                     ))
                 )}
                 {isLoading && (
                   <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white ${selectedPersona.color} shadow-sm shrink-0`}><Bot size={20} className="animate-bounce" /></div>
                      <div className="bg-[#f5f5f4] border border-stone-200 rounded-2xl rounded-tl-none p-4 flex items-center gap-1">
                         <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                         <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                         <span className="w-2 h-2 bg-stone-400 rounded-full animate-bounce"></span>
                      </div>
                   </div>
                 )}
                 <div className="h-4" /> 
              </div>
           </ScrollArea>
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-white shrink-0 z-20 border-t border-stone-100">
           {/* Attachment Preview */}
           {attachment && (
              <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 bg-stone-100 px-3 py-2 rounded-lg w-fit animate-in slide-in-from-bottom-2">
                 <div className="bg-white p-1 rounded border border-stone-200"><FileText size={16} className="text-amber-600"/></div>
                 <span className="text-xs font-bold text-stone-700 max-w-[200px] truncate">{attachment.name}</span>
                 <button onClick={() => setAttachment(null)} className="ml-2 text-stone-400 hover:text-red-500"><X size={14}/></button>
              </div>
           )}

           <div className="max-w-3xl mx-auto bg-[#fcfaf8] border-2 border-stone-200 rounded-3xl shadow-lg p-2 flex flex-col gap-2 relative focus-within:border-amber-500 transition-colors">
              <Textarea 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
                }}
                placeholder={isRecording ? "Đang ghi âm..." : `Nhắn tin cho ${selectedPersona.name}...`} 
                className="min-h-[50px] max-h-[150px] border-0 focus-visible:ring-0 bg-transparent resize-none text-base px-4 py-2 placeholder:text-stone-400 custom-scrollbar" 
                disabled={isRecording || isLoading} 
              />
              
              <div className="flex justify-between items-center px-2 pb-1">
                 <div className="flex gap-1">
                    {/* Nút File Thật */}
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileSelect} />
                    
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button onClick={() => fileInputRef.current?.click()} variant="ghost" size="icon" className="h-9 w-9 text-stone-400 hover:text-amber-600 rounded-full"><Paperclip size={18}/></Button>
                            </TooltipTrigger>
                            <TooltipContent>Đính kèm tệp</TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    <Button onClick={toggleRecording} variant="ghost" size="icon" className={cn("h-9 w-9 rounded-full", isRecording ? "text-red-600 animate-pulse bg-red-50" : "text-stone-400 hover:text-amber-600")}>
                      {isRecording ? <StopCircle size={20} /> : <Mic size={18} />}
                    </Button>
                 </div>
                 
                 <Button onClick={handleSendMessage} disabled={isLoading || (!inputValue.trim() && !attachment)} size="sm" className={cn("rounded-2xl px-5 h-9 font-bold transition-all", isLoading ? "bg-stone-300" : "bg-amber-600 hover:bg-amber-700 text-white")}>
                    {isLoading ? <Loader2 size={16} className="animate-spin"/> : <>Gửi <Send size={14} className="ml-2" /></>}
                 </Button>
              </div>
           </div>
        </div>
      </div>

      {/* 3. RIGHT SIDEBAR (TIPS) - Toggleable */}
      <div className={cn(
        "w-72 bg-[#fcfaf8] border-l border-stone-200 hidden xl:flex flex-col shrink-0 min-h-0 transition-all duration-300",
        !isRightSidebarOpen && "w-0 opacity-0 overflow-hidden border-0"
      )}>
         <div className="p-5 border-b border-stone-200 bg-white/50 shrink-0">
            <h3 className="font-black text-stone-800 text-lg">Trợ lý học tập</h3>
            <p className="text-xs text-stone-500 mt-1">Gợi ý thông minh</p>
         </div>

         <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
               <div>
                 <h4 className="px-1 text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 flex items-center gap-1"><Sparkles size={12} className="text-yellow-500"/> Gợi ý nhanh</h4>
                 <div className="space-y-2">
                    {["Viết dàn ý IELTS Task 2", "Giải thích code Python", "Tạo bài kiểm tra Toán", "Dịch thuật ngữ IT", "Kiểm tra ngữ pháp"].map((prompt, i) => (
                      <Button key={i} onClick={() => setInputValue(prompt)} variant="outline" className="w-full justify-start text-xs h-auto py-2 text-stone-600 bg-white border-stone-200 hover:text-amber-600 hover:border-amber-300 whitespace-normal text-left">
                         {prompt}
                      </Button>
                    ))}
                 </div>
               </div>
            </div>
         </ScrollArea>
      </div>

    </div>
  );
}

// Wrapper để bọc SessionProvider (Sửa lỗi cho layout cũ nếu cần, nhưng tốt nhất nên dùng layout mới)
export default function AITutorPageWrapper() {
    return (
        <SessionProvider>
            <AITutorContent />
        </SessionProvider>
    );
}