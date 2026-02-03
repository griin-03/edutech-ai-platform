"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { logViolation } from "@/app/(dashboard)/student/exam/actions"; // Import action vừa tạo

export function useExamGuard(examId: string, isExamActive: boolean) {
  const [violationCount, setViolationCount] = useState(0);

  useEffect(() => {
    if (!isExamActive) return;

    // 1. Cảnh báo khi rời Tab
    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerViolation("TAB_SWITCH");
      }
    };

    // 2. Cảnh báo khi mất tiêu điểm (Alt+Tab)
    const handleBlur = () => {
      triggerViolation("WINDOW_BLUR");
    };

    // 3. Chặn Copy/Paste
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning("🚫 Cấm sao chép nội dung bài thi!");
    };
    
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      toast.warning("🚫 Cấm dán nội dung vào bài thi!");
    };

    // 4. Chặn chuột phải
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    // Xử lý vi phạm chung
    const triggerViolation = async (type: string) => {
      const messages: {[key: string]: string} = {
        "TAB_SWITCH": "⚠️ CẢNH BÁO: Bạn vừa rời khỏi màn hình thi!",
        "WINDOW_BLUR": "⚠️ CẢNH BÁO: Vui lòng không chuyển cửa sổ!",
      };

      if (messages[type]) {
        toast.error(messages[type], { duration: 4000, position: "top-center" });
      }

      setViolationCount(prev => prev + 1);
      
      // Gửi về server
      await logViolation(examId, type);
    };

    // Đăng ký sự kiện
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [examId, isExamActive]);

  return { violationCount };
}