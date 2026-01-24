"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
// import { Switch } from "@/components/ui/switch"; // Bỏ comment dòng này nếu bạn đã cài shadcn switch
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Shield, Bell, Monitor, Settings, // ĐÃ THÊM: Import Settings ở đây
  Camera, Mail, Moon, Sun, Laptop, Trash2, 
  CheckCircle2, AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// --- Component Switch Giả lập (Để code chạy ngay cả khi chưa cài shadcn/switch) ---
// Nếu bạn đã cài npx shadcn@latest add switch, hãy xóa đoạn này và uncomment dòng import ở trên
const Switch = ({ checked, defaultChecked, onCheckedChange }: { checked?: boolean; defaultChecked?: boolean; onCheckedChange?: (checked: boolean) => void }) => {
  const [isChecked, setIsChecked] = useState(checked || defaultChecked || false);
  
  const toggle = () => {
    const newState = !isChecked;
    setIsChecked(newState);
    onCheckedChange?.(newState);
  };

  return (
    <button 
      onClick={toggle}
      className={cn(
        "w-11 h-6 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 relative",
        isChecked ? "bg-amber-600" : "bg-stone-200 dark:bg-stone-700"
      )}
    >
      <span 
        className={cn(
          "block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out absolute top-0.5 left-0.5",
          isChecked ? "translate-x-5" : "translate-x-0"
        )} 
      />
    </button>
  );
};

// --- DANH MỤC CÀI ĐẶT ---
const SETTINGS_NAV = [
  { id: "profile", label: "Hồ sơ công khai", icon: User, desc: "Thông tin hiển thị trên cộng đồng" },
  { id: "account", label: "Tài khoản & Bảo mật", icon: Shield, desc: "Mật khẩu, 2FA, Email" },
  { id: "notifications", label: "Thông báo", icon: Bell, desc: "Email, Push notification" },
  { id: "appearance", label: "Giao diện", icon: Monitor, desc: "Dark mode, ngôn ngữ" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [isLoading, setIsLoading] = useState(false);
  const { setTheme, theme } = useTheme();

  // Fake loading khi lưu
  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-hidden bg-[#fdfbf7] dark:bg-[#0c0a09] transition-colors duration-500 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl relative animate-in fade-in zoom-in-95 duration-500">
      
      {/* HEADER CỐ ĐỊNH */}
      <div className="p-6 border-b border-stone-200 dark:border-stone-800 bg-white/80 dark:bg-[#0c0a09]/80 backdrop-blur-md shrink-0 z-20">
        <h1 className="text-2xl font-black text-stone-800 dark:text-stone-100 flex items-center gap-2">
          {/* Đã sửa lỗi Settings is not defined */}
          <Settings size={24} className="text-stone-500 animate-spin-slow" /> Cài đặt hệ thống
        </h1>
        <p className="text-stone-500 text-sm font-medium mt-1">
          Quản lý thông tin cá nhân và tùy chỉnh trải nghiệm học tập của bạn.
        </p>
      </div>

      {/* MAIN CONTENT (2 COLUMNS) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT SIDEBAR (NAV) */}
        <div className="w-64 border-r border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#151311]/50 flex-col gap-2 p-4 hidden md:flex shrink-0 overflow-y-auto">
           {SETTINGS_NAV.map((item) => (
             <button
               key={item.id}
               onClick={() => setActiveSection(item.id)}
               className={cn(
                 "flex items-start gap-3 p-3 rounded-xl text-left transition-all duration-200 group",
                 activeSection === item.id 
                   ? "bg-white dark:bg-stone-800 shadow-sm ring-1 ring-stone-200 dark:ring-stone-700" 
                   : "hover:bg-stone-100 dark:hover:bg-stone-800/50"
               )}
             >
                <div className={cn(
                  "p-2 rounded-lg transition-colors",
                  activeSection === item.id ? "bg-amber-100 text-amber-600 dark:bg-amber-900/20" : "bg-stone-200 dark:bg-stone-800 text-stone-500"
                )}>
                   <item.icon size={18} />
                </div>
                <div>
                   <p className={cn("font-bold text-sm", activeSection === item.id ? "text-stone-800 dark:text-stone-100" : "text-stone-600 dark:text-stone-400")}>
                     {item.label}
                   </p>
                   <p className="text-[10px] text-stone-400 line-clamp-1">{item.desc}</p>
                </div>
             </button>
           ))}
        </div>

        {/* RIGHT CONTENT (SCROLLABLE FORM) */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white dark:bg-[#0c0a09] p-4 md:p-8 relative">
           
           <div className="max-w-2xl mx-auto space-y-8 pb-20">
              
              {/* SECTION: PROFILE */}
              {activeSection === "profile" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                   <div>
                      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Hồ sơ công khai</h3>
                      <p className="text-sm text-stone-500">Thông tin này sẽ hiển thị cho giảng viên và các học viên khác.</p>
                   </div>
                   <Separator />
                   
                   <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer">
                         <Avatar className="h-24 w-24 border-4 border-white dark:border-stone-800 shadow-lg">
                            <AvatarImage src="https://github.com/shadcn.png" />
                            <AvatarFallback>TA</AvatarFallback>
                         </Avatar>
                         <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="text-white" size={24} />
                         </div>
                      </div>
                      <div className="space-y-2">
                         <Button variant="outline" size="sm">Thay đổi ảnh đại diện</Button>
                         <p className="text-xs text-stone-400">JPG, GIF or PNG. Tối đa 1MB.</p>
                      </div>
                   </div>

                   <div className="grid gap-4">
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Họ</Label>
                            <Input defaultValue="Nguyễn" className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800" />
                         </div>
                         <div className="space-y-2">
                            <Label>Tên</Label>
                            <Input defaultValue="Tuấn Anh" className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800" />
                         </div>
                      </div>
                      
                      <div className="space-y-2">
                         <Label>Email</Label>
                         <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                            <Input defaultValue="tuananh@edutech.ai" className="pl-9 bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800" disabled />
                         </div>
                      </div>

                      <div className="space-y-2">
                         <Label>Giới thiệu bản thân (Bio)</Label>
                         <Textarea 
                           placeholder="Viết vài dòng về mục tiêu học tập của bạn..." 
                           className="bg-stone-50 dark:bg-stone-900 border-stone-200 dark:border-stone-800 min-h-[100px]"
                         />
                      </div>
                   </div>
                </div>
              )}

              {/* SECTION: ACCOUNT & SECURITY */}
              {activeSection === "account" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                   <div>
                      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Bảo mật tài khoản</h3>
                      <p className="text-sm text-stone-500">Quản lý mật khẩu và các lớp bảo mật tăng cường.</p>
                   </div>
                   <Separator />

                   <div className="space-y-4">
                      <div className="space-y-2">
                         <Label>Mật khẩu hiện tại</Label>
                         <Input type="password" placeholder="••••••••" className="bg-stone-50 dark:bg-stone-900" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-2">
                            <Label>Mật khẩu mới</Label>
                            <Input type="password" className="bg-stone-50 dark:bg-stone-900" />
                         </div>
                         <div className="space-y-2">
                            <Label>Xác nhận mật khẩu</Label>
                            <Input type="password" className="bg-stone-50 dark:bg-stone-900" />
                         </div>
                      </div>
                      <div className="flex justify-end">
                         <Button variant="outline" size="sm">Đổi mật khẩu</Button>
                      </div>
                   </div>

                   <Separator />

                   <div className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/50 dark:bg-stone-900/50">
                      <div className="space-y-0.5">
                         <div className="font-bold text-sm text-stone-800 dark:text-stone-100 flex items-center gap-2">
                            <Shield size={16} className="text-emerald-600" /> Xác thực 2 lớp (2FA)
                         </div>
                         <p className="text-xs text-stone-500">Tăng cường bảo mật bằng tin nhắn SMS hoặc Google Auth.</p>
                      </div>
                      <div className="flex items-center h-6">
                         <Switch />
                      </div>
                   </div>

                   {/* DANGER ZONE */}
                   <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-xl mt-8">
                      <h4 className="text-red-600 font-bold text-sm mb-1 flex items-center gap-2"><AlertTriangle size={16}/> Vùng nguy hiểm</h4>
                      <p className="text-xs text-stone-500 mb-4">Hành động này không thể hoàn tác. Toàn bộ dữ liệu học tập sẽ bị xóa.</p>
                      <Button variant="destructive" size="sm" className="w-full sm:w-auto"><Trash2 size={14} className="mr-2"/> Xóa tài khoản</Button>
                   </div>
                </div>
              )}

              {/* SECTION: APPEARANCE */}
              {activeSection === "appearance" && (
                <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                   <div>
                      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Giao diện người dùng</h3>
                      <p className="text-sm text-stone-500">Tùy chỉnh giao diện theo sở thích của bạn.</p>
                   </div>
                   <Separator />

                   <div className="space-y-4">
                      <Label>Chủ đề (Theme)</Label>
                      <div className="grid grid-cols-3 gap-4">
                         <div 
                           onClick={() => setTheme("light")}
                           className={cn(
                             "cursor-pointer border-2 rounded-xl p-2 hover:border-amber-500 transition-all",
                             theme === "light" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-stone-200 dark:border-stone-800"
                           )}
                         >
                            <div className="bg-[#fdfbf7] h-24 rounded-lg mb-2 border border-stone-200 flex items-center justify-center">
                               <Sun className="text-amber-500" />
                            </div>
                            <div className="text-center font-bold text-sm">Light (Trà Sữa)</div>
                         </div>

                         <div 
                           onClick={() => setTheme("dark")}
                           className={cn(
                             "cursor-pointer border-2 rounded-xl p-2 hover:border-amber-500 transition-all",
                             theme === "dark" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-stone-200 dark:border-stone-800"
                           )}
                         >
                            <div className="bg-[#0c0a09] h-24 rounded-lg mb-2 border border-stone-700 flex items-center justify-center">
                               <Moon className="text-stone-100" />
                            </div>
                            <div className="text-center font-bold text-sm">Dark (Cà Phê)</div>
                         </div>

                         <div 
                           onClick={() => setTheme("system")}
                           className={cn(
                             "cursor-pointer border-2 rounded-xl p-2 hover:border-amber-500 transition-all",
                             theme === "system" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10" : "border-stone-200 dark:border-stone-800"
                           )}
                         >
                            <div className="bg-gradient-to-r from-[#fdfbf7] to-[#0c0a09] h-24 rounded-lg mb-2 border border-stone-200 flex items-center justify-center">
                               <Laptop className="text-stone-500 mix-blend-difference" />
                            </div>
                            <div className="text-center font-bold text-sm">Hệ thống</div>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-4 pt-4">
                      <Label>Ngôn ngữ</Label>
                      <div className="flex gap-2">
                         <Button variant="outline" className="border-amber-500 text-amber-600 bg-amber-50">Tiếng Việt</Button>
                         <Button variant="outline">English</Button>
                         <Button variant="outline">日本語</Button>
                      </div>
                   </div>
                </div>
              )}

              {/* SECTION: NOTIFICATIONS */}
              {activeSection === "notifications" && (
                 <div className="space-y-6 animate-in slide-in-from-right-4 fade-in duration-300">
                    <div>
                      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Cài đặt thông báo</h3>
                      <p className="text-sm text-stone-500">Chọn cách bạn muốn nhận thông báo.</p>
                   </div>
                   <Separator />
                   
                   <div className="space-y-6">
                      {[
                        { title: "Thông báo qua Email", desc: "Nhận email về bài tập mới và kết quả thi.", default: true },
                        { title: "Thông báo đẩy (Push)", desc: "Thông báo trên trình duyệt khi có tin nhắn mới.", default: true },
                        { title: "Tin tức & Khuyến mãi", desc: "Nhận thông tin về khóa học mới (Không spam).", default: false },
                        { title: "Nhắc nhở học tập", desc: "Nhắc nhở khi bạn chưa hoàn thành mục tiêu ngày.", default: true },
                      ].map((setting, i) => (
                        <div key={i} className="flex items-center justify-between">
                           <div className="space-y-0.5">
                              <label className="text-sm font-bold text-stone-800 dark:text-stone-200 block">{setting.title}</label>
                              <p className="text-xs text-stone-500">{setting.desc}</p>
                           </div>
                           <Switch defaultChecked={setting.default} />
                        </div>
                      ))}
                   </div>
                 </div>
              )}

           </div>

           {/* FLOATING SAVE BAR */}
           <div className="absolute bottom-4 left-4 right-4 md:left-8 md:right-8 bg-stone-900 dark:bg-stone-800 text-white p-4 rounded-xl shadow-2xl flex justify-between items-center animate-in slide-in-from-bottom-4 fade-in">
              <div className="text-sm">
                 <span className="font-bold">Chưa lưu thay đổi.</span> Hãy chắc chắn bạn đã kiểm tra kỹ.
              </div>
              <div className="flex gap-2">
                 <Button variant="ghost" size="sm" className="text-stone-300 hover:text-white hover:bg-stone-700">Hủy</Button>
                 <Button onClick={handleSave} size="sm" className="bg-amber-600 hover:bg-amber-500 text-white font-bold min-w-[100px]">
                    {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
                 </Button>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
}