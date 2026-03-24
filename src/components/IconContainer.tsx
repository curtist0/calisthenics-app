"use client";
import React from "react";

export default function IconContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-white/5 to-white/2 border border-white/10 flex items-center justify-center text-white/90 flex-shrink-0">
      {children}
    </div>
  );
}
