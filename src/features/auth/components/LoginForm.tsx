"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

// Schema kiểm tra dữ liệu nhập vào
const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  // Xử lý khi bấm nút Login
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Giả lập gọi API mất 1 giây
    setTimeout(() => {
      // Mock User Data (Sau này sẽ lấy từ API thật)
      const mockUser = {
        id: "1",
        name: "Nguyen Van A",
        email: values.email,
        role: "student" as const, // Mặc định vào là Student để test
        avatar: "https://github.com/shadcn.png"
      };

      login(mockUser); // Lưu vào Global Store
      setIsLoading(false);
      router.push("/student/dashboard"); // Chuyển hướng vào trang Dashboard
    }, 1000);
  }

  // Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <Card className="w-[400px] shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center text-blue-600">Edutech AI</CardTitle>
          <CardDescription className="text-center">
            Enter your email to access the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="student" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    placeholder="student@example.com" 
                    type="email" 
                    {...register("email")}
                  />
                  {errors.email && <span className="text-xs text-red-500">{errors.email.message}</span>}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    {...register("password")}
                  />
                  {errors.password && <span className="text-xs text-red-500">{errors.password.message}</span>}
                </div>
                <Button className="w-full bg-blue-600 hover:bg-blue-700" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In"}
                </Button>
              </div>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-xs text-slate-500">
            Demo Account: student@example.com / 123456
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}