"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  User, Shield, Bell, Monitor, Camera, Save, Loader2, AlertCircle 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner"; // Sử dụng Toast để thông báo đẹp hơn

export default function SettingsPage() {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Ref cho nút chọn ảnh ẩn
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- STATE DỮ LIỆU ---
  const [profile, setProfile] = useState({ name: "", email: "", bio: "", avatar: "" });
  const [security, setSecurity] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [preferences, setPreferences] = useState({ emailNotify: true, pushNotify: false, theme: "light" });

  // Load dữ liệu khi vào trang
  useEffect(() => {
    if (session?.user) {
        setProfile({
            name: session.user.name || "",
            email: session.user.email || "",
            bio: "", // Lưu ý: Session mặc định không có bio, trừ khi bạn custom lại callback session
            avatar: session.user.image || "" 
        });
    }
  }, [session]);

  // --- HÀM XỬ LÝ INPUT ---
  const handleProfileChange = (field: string, value: string) => {
      setProfile(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
  };

  const handleSecurityChange = (field: string, value: string) => {
      setSecurity(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
  };

  const handlePrefChange = (field: string, value: any) => {
      setPreferences(prev => ({ ...prev, [field]: value }));
      setHasChanges(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click(); 
  };

  // --- [NÂNG CẤP QUAN TRỌNG] LOGIC NÉN ẢNH TỰ ĐỘNG ---
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Hàm nén ảnh thủ công (Resize về chiều ngang 500px + JPEG chất lượng 80%)
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (e) => {
                const img = document.createElement("img");
                img.src = e.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 500; // 500px là đủ nét cho Avatar
                    const scaleSize = MAX_WIDTH / img.width;
                    
                    // Nếu ảnh gốc nhỏ hơn 500px thì giữ nguyên
                    if (scaleSize >= 1) {
                         resolve(e.target?.result as string);
                         return;
                    }

                    // Tính toán kích thước mới
                    canvas.width = MAX_WIDTH;
                    canvas.height = img.height * scaleSize;
                    
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Xuất ra dạng Base64 (JPEG, chất lượng 0.8) -> Giảm dung lượng cực mạnh
                    resolve(canvas.toDataURL("image/jpeg", 0.8));
                };
            };
        });
    };

    try {
        // Hiển thị loading nhẹ ở nút Lưu (hoặc Toast) để người dùng biết đang xử lý
        toast.info("Đang tối ưu hóa ảnh...");
        
        const compressedBase64 = await compressImage(file);
        
        // Cập nhật State để hiển thị Preview ngay
        setProfile(prev => ({ ...prev, avatar: compressedBase64 }));
        setHasChanges(true);
        toast.success("Đã chọn ảnh xong! Hãy bấm 'Lưu thay đổi'.");
        
    } catch (error) {
        console.error(error);
        toast.error("Có lỗi khi xử lý ảnh.");
    }
  };

  // --- GỬI DỮ LIỆU LÊN SERVER ---
  const handleSaveChanges = async () => {
      setLoading(true);
      try {
          let payload = {};
          let type = "";

          // Validate Client-side trước khi gửi
          if (activeTab === "profile") {
              if (profile.name.trim().length < 2) {
                  toast.warning("Tên hiển thị quá ngắn!"); 
                  setLoading(false); 
                  return;
              }
              type = "profile";
              // Gửi cả avatar và bio
              payload = { name: profile.name, bio: profile.bio, avatar: profile.avatar };
          } 
          else if (activeTab === "security") {
              if (!security.currentPassword) {
                  toast.warning("Vui lòng nhập mật khẩu hiện tại!"); setLoading(false); return;
              }
              if (security.newPassword !== security.confirmPassword) {
                  toast.error("Mật khẩu xác nhận không khớp!"); setLoading(false); return;
              }
              if (security.newPassword.length < 6) {
                  toast.warning("Mật khẩu mới phải từ 6 ký tự trở lên!"); setLoading(false); return;
              }
              type = "security";
              payload = security;
          } 
          else {
              type = "preferences";
              payload = preferences;
          }

          const res = await fetch("/api/settings", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ type, data: payload })
          });

          const json = await res.json();

          if (!res.ok) throw new Error(json.error || "Lỗi không xác định");

          // THÀNH CÔNG
          toast.success(json.message || "Lưu thay đổi thành công!");
          setHasChanges(false);
          
          // Cập nhật lại Session Client (để Avatar trên Header đổi ngay lập tức)
          if (activeTab === "profile") {
              await update({ 
                  name: profile.name, 
                  image: profile.avatar 
              });
          }
          
          // Reset form mật khẩu để an toàn
          if (activeTab === "security") {
              setSecurity({ currentPassword: "", newPassword: "", confirmPassword: "" });
          }

      } catch (error: any) {
          console.error(error);
          toast.error(error.message || "Có lỗi xảy ra khi lưu.");
      } finally {
          setLoading(false);
      }
  };

  const MENU_ITEMS = [
    { id: "profile", label: "Hồ sơ công khai", icon: User, desc: "Tên hiển thị, Avatar, Bio." },
    { id: "security", label: "Tài khoản & Bảo mật", icon: Shield, desc: "Đổi mật khẩu." },
    { id: "notifications", label: "Thông báo", icon: Bell, desc: "Email, Push notification." },
    { id: "appearance", label: "Giao diện", icon: Monitor, desc: "Dark mode, ngôn ngữ." },
  ];

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 p-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      
      {/* SIDEBAR MENU */}
      <div className="w-full lg:w-64 flex flex-col gap-2 shrink-0">
         <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 mb-4 px-2">Cài đặt</h2>
         {MENU_ITEMS.map((item) => (
            <button
               key={item.id}
               onClick={() => { setActiveTab(item.id); setHasChanges(false); }}
               className={cn(
                  "flex items-start gap-3 p-3 rounded-xl text-left transition-all",
                  activeTab === item.id 
                    ? "bg-white dark:bg-stone-800 shadow-sm border border-stone-200 dark:border-stone-700" 
                    : "hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-500"
               )}
            >
               <div className={cn("p-2 rounded-full shrink-0", activeTab === item.id ? "bg-amber-100 text-amber-600" : "bg-stone-100 dark:bg-stone-900")}>
                  <item.icon size={18} />
               </div>
               <div>
                  <p className={cn("font-bold text-sm", activeTab === item.id ? "text-stone-900 dark:text-stone-100" : "text-stone-600")}>{item.label}</p>
                  <p className="text-[10px] text-stone-400 line-clamp-1">{item.desc}</p>
               </div>
            </button>
         ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 bg-white dark:bg-[#1c1917] rounded-3xl border border-stone-200 dark:border-stone-800 shadow-sm relative overflow-hidden flex flex-col">
         <div className="flex-1 overflow-y-auto p-8 pb-24 custom-scrollbar">
            
            {/* --- TAB HỒ SƠ --- */}
            {activeTab === "profile" && (
               <div className="space-y-8 max-w-2xl">
                  <div>
                     <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Hồ sơ công khai</h3>
                     <p className="text-sm text-stone-500">Thông tin này sẽ hiển thị trên cộng đồng.</p>
                  </div>
                  
                  <div className="flex items-center gap-6">
                     <Avatar 
                        className="h-24 w-24 border-4 border-stone-100 dark:border-stone-800 shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={handleAvatarClick}
                     >
                        <AvatarImage src={profile.avatar || undefined} className="object-cover" />
                        <AvatarFallback className="text-2xl font-bold bg-amber-100 text-amber-700">{profile.name ? profile.name[0] : "U"}</AvatarFallback>
                     </Avatar>
                     <div className="space-y-2">
                        {/* Input file ẩn */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            className="hidden" 
                            accept="image/*" 
                        />
                        <Button variant="outline" onClick={handleAvatarClick} className="font-bold text-xs h-9">
                            <Camera className="mr-2 h-4 w-4"/> Thay đổi ảnh đại diện
                        </Button>
                        <p className="text-[10px] text-stone-400">Tự động nén ảnh để upload siêu tốc.</p>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Họ & Tên hiển thị</Label>
                        <Input value={profile.name} onChange={(e) => handleProfileChange("name", e.target.value)} placeholder="Nhập tên của bạn" />
                     </div>
                     <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profile.email} disabled className="bg-stone-50 text-stone-500 cursor-not-allowed" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <Label>Bio (Giới thiệu)</Label>
                     <Textarea 
                        value={profile.bio} 
                        onChange={(e) => handleProfileChange("bio", e.target.value)} 
                        placeholder="Viết vài dòng về mục tiêu học tập của bạn..." 
                        className="min-h-[120px]"
                     />
                  </div>
               </div>
            )}

            {/* --- TAB BẢO MẬT --- */}
            {activeTab === "security" && (
               <div className="space-y-8 max-w-2xl">
                  <div>
                     <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2"><Shield size={18} className="text-emerald-500"/> Bảo mật tài khoản</h3>
                     <p className="text-sm text-stone-500">Lưu ý: Nếu đăng nhập bằng Google, bạn không cần đổi mật khẩu tại đây.</p>
                  </div>

                  <div className="space-y-5 bg-stone-50 dark:bg-stone-900/30 p-6 rounded-xl border border-stone-100 dark:border-stone-800">
                     <div className="space-y-2">
                        <Label>Mật khẩu hiện tại</Label>
                        <Input type="password" value={security.currentPassword} onChange={(e) => handleSecurityChange("currentPassword", e.target.value)} placeholder="••••••" />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                           <Label>Mật khẩu mới</Label>
                           <Input type="password" value={security.newPassword} onChange={(e) => handleSecurityChange("newPassword", e.target.value)} placeholder="Tối thiểu 6 ký tự" />
                        </div>
                        <div className="space-y-2">
                           <Label>Nhập lại mật khẩu mới</Label>
                           <Input type="password" value={security.confirmPassword} onChange={(e) => handleSecurityChange("confirmPassword", e.target.value)} placeholder="••••••" />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {/* --- TAB CẤU HÌNH --- */}
            {activeTab === "notifications" && (
               <div className="space-y-8 max-w-2xl">
                   <div><h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Cài đặt thông báo</h3></div>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-xl">
                          <div><h4 className="font-bold text-sm">Email</h4><p className="text-xs text-stone-500">Nhận kết quả thi.</p></div>
                          <Switch checked={preferences.emailNotify} onCheckedChange={(c) => handlePrefChange("emailNotify", c)} />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-xl">
                          <div><h4 className="font-bold text-sm">Push Notification</h4><p className="text-xs text-stone-500">Thông báo đẩy.</p></div>
                          <Switch checked={preferences.pushNotify} onCheckedChange={(c) => handlePrefChange("pushNotify", c)} />
                      </div>
                   </div>
               </div>
            )}
            
             {/* --- TAB GIAO DIỆN --- */}
            {activeTab === "appearance" && (
                <div className="space-y-8 max-w-2xl">
                   <div>
                      <h3 className="text-lg font-bold text-stone-800 dark:text-stone-100">Giao diện người dùng</h3>
                      <p className="text-sm text-stone-500">Tùy chỉnh trải nghiệm nhìn của bạn.</p>
                   </div>
                   <div className="grid grid-cols-3 gap-4">
                      {['light', 'dark', 'system'].map((theme) => (
                          <div 
                            key={theme}
                            onClick={() => handlePrefChange("theme", theme)}
                            className={cn(
                                "cursor-pointer border-2 rounded-xl p-2 space-y-2 hover:border-amber-500 transition-all",
                                preferences.theme === theme ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20" : "border-transparent bg-stone-100 dark:bg-stone-800"
                            )}
                          >
                             <div className={cn("h-20 rounded-lg w-full", theme==='dark' ? "bg-stone-900" : "bg-white border border-stone-200")}></div>
                             <p className="text-center text-xs font-bold capitalize">{theme}</p>
                          </div>
                      ))}
                   </div>
                </div>
            )}

         </div>

         {/* THANH LƯU TRẠNG THÁI */}
         <div className={cn(
            "absolute bottom-0 left-0 right-0 bg-stone-900 text-white p-4 flex items-center justify-between transition-all duration-300 transform shadow-2xl",
            hasChanges ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
         )}>
            <div className="flex items-center gap-2">
               <AlertCircle size={20} className="text-amber-500" />
               <p className="text-sm font-medium">Bạn có thay đổi chưa lưu.</p>
            </div>
            <div className="flex gap-3">
               <Button 
                 variant="ghost" 
                 onClick={() => setHasChanges(false)} // Hủy bỏ (UI reset)
                 className="text-stone-300 hover:text-white hover:bg-stone-800"
               >
                  Hủy
               </Button>
               <Button 
                 onClick={handleSaveChanges} 
                 disabled={loading}
                 className="bg-amber-600 hover:bg-amber-700 text-white font-bold transition-all hover:scale-105"
               >
                  {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : <Save className="mr-2 h-4 w-4"/>} 
                  Lưu thay đổi
               </Button>
            </div>
         </div>
      </div>
    </div>
  );
}