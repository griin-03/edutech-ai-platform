"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";

export default function MobileAppLayout({ children }: { children: React.ReactNode }) {
  return (
    // Bọc SessionProvider để app Mobile có thể đọc được thông tin đăng nhập
    <SessionProvider>
      {children}
    </SessionProvider>
  );
}