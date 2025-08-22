"use client";

import Link from "next/link";

export default function LandingPageSimple() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Everest Preparatórios - VERSÃO SIMPLES
        </h1>
        
        <div className="text-center space-y-4">
          <p className="text-xl">Esta é uma versão simplificada para teste</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/ciaar">
              <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                CIAAR
              </button>
            </Link>
            
            <Link href="/login">
              <button className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                Área do Aluno
              </button>
            </Link>
            
            <Link href="/login">
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Área VIP
              </button>
            </Link>
          </div>
          
          <div className="mt-8">
            <Link href="/teste" className="text-blue-400 hover:text-blue-300 underline">
              Página de Teste
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
