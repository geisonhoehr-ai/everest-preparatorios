"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  className,
  text 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8",
    xl: "h-12 w-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <Loader2 className={cn("animate-spin text-orange-500", sizeClasses[size])} />
      {text && (
        <p className="mt-2 text-sm text-gray-500 text-center">{text}</p>
      )}
    </div>
  );
}

// Componente de loading para páginas inteiras
export function PageLoadingSpinner({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155]">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
          <span className="text-white font-bold text-2xl">E</span>
        </div>
        <LoadingSpinner size="lg" text={text} />
      </div>
    </div>
  );
}

// Componente de loading para cards
export function CardLoadingSpinner({ text = "Carregando..." }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <LoadingSpinner size="md" text={text} />
    </div>
  );
}

// Componente de loading para botões
export function ButtonLoadingSpinner({ size = "sm" }: { size?: "sm" | "md" }) {
  return (
    <Loader2 className={cn(
      "animate-spin",
      size === "sm" ? "h-4 w-4" : "h-5 w-5"
    )} />
  );
} 