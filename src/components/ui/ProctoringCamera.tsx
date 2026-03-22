"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import Webcam from "react-webcam";
import { AlertCircle, Camera, CheckCircle2, ScanEye } from "lucide-react";

interface ProctoringProps {
  onViolationDetected: (reason: string) => void;
}

const loadExternalScript = (id: string, src: string) => {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id) || (window as any)[id === "tf-script" ? "tf" : "cocoSsd"]) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.id = id;
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
};

export default function ProctoringCamera({ onViolationDetected }: ProctoringProps) {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null); 
  
  // 🔥 Biến đếm số giây thí sinh vắng mặt (Tránh phạt oan do giật lag)
  const missingPersonFrames = useRef(0);

  const [isCameraGranted, setIsCameraGranted] = useState(false); 
  const [objectModel, setObjectModel] = useState<any>(null);
  const [status, setStatus] = useState<"HỢP LỆ" | "CẢNH BÁO">("HỢP LỆ");
  const [warningMessage, setWarningMessage] = useState("");
  const [loadingText, setLoadingText] = useState("Đang chờ cấp quyền Camera...");
  const [aiVisionLog, setAiVisionLog] = useState<string>("Đang chờ AI...");

  const triggerViolation = useCallback((message: string) => {
    setStatus("CẢNH BÁO");
    setWarningMessage(message);
    onViolationDetected(message);
    
    setTimeout(() => {
      setStatus("HỢP LỆ");
      setWarningMessage("");
    }, 3000);
  }, [onViolationDetected]);

  // CHỐNG CHUYỂN TAB 
  useEffect(() => {
    if (!isCameraGranted) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") triggerViolation("Rời khỏi trang thi / Chuyển Tab!");
    };
    const handleWindowBlur = () => {
      triggerViolation("Mở phần mềm khác / Mất tập trung!");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, [isCameraGranted, triggerViolation]);

  // KHỞI ĐỘNG AI 
  useEffect(() => {
    if (isCameraGranted && !objectModel) {
      const initAI = async () => {
        try {
          setLoadingText("Đang tải AI (1/2)...");
          await loadExternalScript("tf-script", "https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@3.21.0/dist/tf.min.js");
          
          setLoadingText("Đang tải AI (2/2)...");
          await loadExternalScript("coco-script", "https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd@2.2.2/dist/coco-ssd.min.js");

          const tf = (window as any).tf;
          const cocoSsd = (window as any).cocoSsd;

          await tf.setBackend('webgl'); 
          await tf.ready();
          
          const model = await cocoSsd.load();
          setObjectModel(model);
          console.log(">> Đã nạp xong AI chống gian lận");
        } catch (error) {
          setLoadingText("Lỗi mạng! Hãy F5 lại");
        }
      };
      initAI();
    }
  }, [isCameraGranted, objectModel]);

  // VÒNG LẶP QUÉT: TÌM ĐIỆN THOẠI & KIỂM TRA SỰ CÓ MẶT
  useEffect(() => {
    if (!objectModel) return;

    const interval = setInterval(async () => {
      if (
        webcamRef.current && 
        webcamRef.current.video && 
        webcamRef.current.video.readyState === 4 &&
        canvasRef.current
      ) {
        const video = webcamRef.current.video;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Quét vật thể
        const objects = await objectModel.detect(video, 20, 0.3);

        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);

        let hasPhone = false;
        let hasPerson = false;
        let seenList: string[] = [];

        objects.forEach((obj: any) => {
          seenList.push(`${obj.class} (${Math.round(obj.score * 100)}%)`);

          // Kiểm tra xem có Điện thoại hay Người không
          if (obj.class === "cell phone") hasPhone = true;
          if (obj.class === "person") hasPerson = true;

          if (ctx) {
            const [x, y, width, height] = obj.bbox;
            const isPhone = obj.class === "cell phone";
            
            ctx.strokeStyle = isPhone ? "#ef4444" : "#22c55e";
            ctx.lineWidth = 4;
            ctx.strokeRect(x, y, width, height);

            ctx.fillStyle = isPhone ? "#ef4444" : "#22c55e";
            ctx.font = "bold 18px Arial";
            ctx.fillText(`${obj.class} ${Math.round(obj.score * 100)}%`, x, y > 20 ? y - 8 : 20);
          }
        });

        setAiVisionLog(seenList.length > 0 ? seenList.join(" | ") : "Không thấy gì rõ ràng");

        // 🔥 LOGIC XỬ LÝ GIAN LẬN THÔNG MINH
        if (hasPhone) {
          triggerViolation("Phát hiện sử dụng Điện thoại!");
          missingPersonFrames.current = 0; // Thấy đt thì reset bộ đếm người
        } 
        else if (!hasPerson) {
          // Nếu không thấy người, cộng dồn bộ đếm (mỗi nhịp là 1 giây)
          missingPersonFrames.current += 1;
          
          // Bắt buộc vắng mặt 3 giây liên tục mới phạt
          if (missingPersonFrames.current >= 3) {
            triggerViolation("Không thấy thí sinh trong camera!");
            missingPersonFrames.current = 0; // Phạt xong reset lại từ đầu
          }
        } 
        else {
          // Nếu có người xuất hiện lại -> Hủy bỏ ngay lập tức bộ đếm vắng mặt
          missingPersonFrames.current = 0;
        }
      }
    }, 1000); // Quét mỗi 1 giây

    return () => clearInterval(interval);
  }, [objectModel, triggerViolation]);

  return (
    <div className="relative w-72 h-52 bg-stone-900 rounded-xl overflow-hidden border-2 border-stone-800 shadow-2xl flex flex-col group">
      
      {!objectModel ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 z-20 bg-stone-900">
          <Camera className="animate-pulse mb-2" size={24} />
          <span className="text-xs font-bold text-center px-2">{loadingText}</span>
        </div>
      ) : null}

      <div className="relative flex-1 bg-black">
        <Webcam
          ref={webcamRef}
          audio={false}
          className="absolute inset-0 w-full h-full object-cover"
          mirrored={true}
          onUserMedia={() => setIsCameraGranted(true)}
        />
        
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
          style={{ transform: "scaleX(-1)" }} 
        />

        {objectModel && (
          <div className={`absolute top-0 left-0 right-0 p-1.5 text-[10px] font-bold text-center flex items-center justify-center gap-1 transition-colors z-20 ${
            status === "HỢP LỆ" ? "bg-emerald-500/80 text-white" : "bg-red-600 text-white animate-pulse"
          }`}>
            {status === "HỢP LỆ" ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
            {status === "HỢP LỆ" ? "GIÁM SÁT KÍCH HOẠT" : warningMessage}
          </div>
        )}
        
        {status === "CẢNH BÁO" && (
          <div className="absolute inset-0 border-4 border-red-500 pointer-events-none animate-pulse z-20"></div>
        )}
      </div>

      <div className="h-6 bg-stone-950 flex items-center px-2 z-20 border-t border-stone-800 text-[9px] text-stone-400 font-mono truncate overflow-hidden">
        <ScanEye size={12} className="mr-1 text-blue-500 shrink-0"/> 
        <span className="truncate">{aiVisionLog}</span>
      </div>
    </div>
  );
}