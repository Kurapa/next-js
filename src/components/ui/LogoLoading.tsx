// src/components/ui/LogoLoading.tsx
"use client";

import { useEffect, useState } from "react";
import { Sprout } from "lucide-react";

export default function LogoLoading({ onComplete }: { onComplete: () => void }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
      setTimeout(onComplete, 800);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 transition-opacity duration-800 ${
        isLoaded ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="relative">
        {/* Animated circles */}
        <div className="absolute inset-0 -m-12">
          <div className="absolute inset-0 rounded-full bg-emerald-200/30 animate-ping" style={{ animationDuration: "2s" }}></div>
          <div className="absolute inset-0 rounded-full bg-green-200/20 animate-ping" style={{ animationDuration: "2.5s", animationDelay: "0.3s" }}></div>
        </div>

        {/* Logo */}
        <div className="relative bg-white rounded-3xl shadow-2xl p-8 animate-bounce" style={{ animationDuration: "1.5s", animationIterationCount: "2" }}>
          <Sprout className="w-20 h-20 text-emerald-600 animate-pulse" strokeWidth={1.5} />
        </div>

        {/* Loading text */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold text-emerald-800 animate-pulse">AgroConnect</h2>
          <div className="mt-4 flex justify-center gap-1">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0s" }}></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0.4s" }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}