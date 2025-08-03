"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ExtensivoPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] text-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <span className="text-lg font-medium">Redirecionando...</span>
      </div>
    </div>
  );
} 