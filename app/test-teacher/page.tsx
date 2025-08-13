"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function TestTeacherPage() {
  const [status, setStatus] = useState<string>("Iniciando...");
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const testAuth = async () => {
      try {
        setStatus("Verificando autenticação...");
        console.log("🔍 [TEST] Verificando autenticação...");
        
        const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          setStatus(`Erro de autenticação: ${authError.message}`);
          console.error("❌ [TEST] Erro de autenticação:", authError);
          return;
        }

        if (!currentUser) {
          setStatus("Nenhum usuário autenticado");
          console.log("❌ [TEST] Nenhum usuário autenticado");
          router.push('/login');
          return;
        }

        setStatus(`Usuário autenticado: ${currentUser.email}`);
        console.log("✅ [TEST] Usuário autenticado:", currentUser.email);
        setUser(currentUser);
        
      } catch (error) {
        setStatus(`Erro inesperado: ${error}`);
        console.error("❌ [TEST] Erro inesperado:", error);
      }
    };

    testAuth();
  }, [router, supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/login');
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#334155] flex items-center justify-center">
      <div className="bg-gray-800 p-8 rounded-lg max-w-md w-full">
        <h1 className="text-2xl font-bold text-white mb-6 text-center">
          Teste Teacher Page
        </h1>
        
        <div className="space-y-4">
          <div className="bg-gray-700 p-4 rounded">
            <p className="text-gray-300 text-sm">Status:</p>
            <p className="text-white font-mono text-sm">{status}</p>
          </div>
          
          {user && (
            <div className="bg-green-900/20 p-4 rounded border border-green-500/30">
              <p className="text-green-300 text-sm">✅ Usuário Logado:</p>
              <p className="text-white font-mono text-sm">{user.email}</p>
            </div>
          )}
          
          <div className="flex gap-2">
            <button
              onClick={() => router.push('/teacher')}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
            >
              Ir para Teacher
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
