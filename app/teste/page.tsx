"use client";

export default function TestePage() {
  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">✅ TESTE FUNCIONANDO!</h1>
        <p className="text-xl">Se você está vendo esta página, o Next.js está funcionando!</p>
        <a href="/" className="text-blue-400 hover:text-blue-300 underline mt-4 block">
          Voltar para Home
        </a>
      </div>
    </div>
  );
}
