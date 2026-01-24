"use client";

import { useAuthStore } from "@/stores/authStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const user = useAuthStore((state) => state.user);

  return (
    <header className="flex h-16 items-center justify-end gap-4 border-b bg-white/50 backdrop-blur-md px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium leading-none text-slate-900">{user?.name || "Guest User"}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role || "Student"}</p>
        </div>
        <Avatar className="cursor-pointer ring-2 ring-teal-500 ring-offset-2">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white font-bold">
            {user?.name?.[0] || "U"}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}