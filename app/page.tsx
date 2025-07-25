"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getUserRoleClient } from "@/lib/get-user-role";

export default function LandingPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function checkAndRedirect() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const role = await getUserRoleClient(user.id);
          console.log("User role on landing page:", role);
          
          if (role === "teacher") {
            router.push("/teacher");
          } else if (role === "admin" || role === "student") {
            router.push("/dashboard");
          } else {
            // Se tiver usuário mas não tiver role, vai para dashboard
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setChecking(false);
      }
    }
    checkAndRedirect();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-white">
        <span className="text-lg">Carregando...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#18181b] to-[#23272f] text-white px-4">
      <header className="w-full max-w-4xl flex flex-col items-center mt-12 mb-8">
        <h1 className="text-4xl md:text-5xl font-extrabold text-center mb-4 tracking-tight">
          Everest Preparatórios
        </h1>
        <h2 className="text-xl md:text-2xl font-medium text-center text-primary mb-2">
          O melhor em Português e Redação para o CIAAR da Força Aérea Brasileira
        </h2>
        <p className="text-center text-lg text-gray-300 max-w-2xl mt-2">
          Plataforma completa, feita para quem quer conquistar a aprovação no concurso do CIAAR. Tudo o que você precisa para estudar português e redação de forma eficiente, moderna e focada no edital da Força Aérea Brasileira.
        </p>
      </header>
      <main className="flex flex-col items-center gap-8 w-full max-w-3xl">
        <div className="grid md:grid-cols-3 gap-6 w-full">
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">📚</span>
            <h3 className="font-bold text-lg mb-1">Flashcards Inteligentes</h3>
            <p className="text-gray-400 text-center text-sm">Memorize regras, dicas e pegadinhas de português com o método mais eficiente. Algoritmo de repetição espaçada para você nunca esquecer o que estudou.</p>
          </div>
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">✍️</span>
            <h3 className="font-bold text-lg mb-1">Redação Corrigida</h3>
            <p className="text-gray-400 text-center text-sm">Envie suas redações e receba feedback detalhado dos nossos professores. Evolua de verdade com correções personalizadas.</p>
          </div>
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">🛩️</span>
            <h3 className="font-bold text-lg mb-1">Foco no CIAAR</h3>
            <p className="text-gray-400 text-center text-sm">Conteúdo, simulados e lives 100% alinhados ao edital da Força Aérea Brasileira. Estude o que realmente cai na prova.</p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6 w-full mt-8">
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">📝</span>
            <h3 className="font-bold text-lg mb-1">Simulados e Questões</h3>
            <p className="text-gray-400 text-center text-sm">Treine com simulados inéditos e questões comentadas. Veja seu desempenho e foque nos seus pontos fracos.</p>
          </div>
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">👥</span>
            <h3 className="font-bold text-lg mb-1">Comunidade Exclusiva</h3>
            <p className="text-gray-400 text-center text-sm">Tire dúvidas, compartilhe experiências e estude junto com outros candidatos. Suporte direto dos professores.</p>
          </div>
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">🏆</span>
            <h3 className="font-bold text-lg mb-1">Ranking e Progresso</h3>
            <p className="text-gray-400 text-center text-sm">Acompanhe sua evolução, dispute o ranking com outros alunos e mantenha a motivação alta até a aprovação.</p>
          </div>
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">🎥</span>
            <h3 className="font-bold text-lg mb-1">Lives e Aulas Especiais</h3>
            <p className="text-gray-400 text-center text-sm">Participe de lives exclusivas, tire dúvidas ao vivo e tenha acesso a conteúdos extras para potencializar seus estudos.</p>
          </div>
        </div>
        <Link href="/login">
          <button className="mt-8 px-8 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-orange-700 text-white font-bold text-lg shadow-lg hover:scale-105 transition-transform">
            Entrar na Plataforma
          </button>
        </Link>
      </main>
      <footer className="mt-16 text-gray-500 text-xs text-center">
        &copy; {new Date().getFullYear()} Everest Preparatórios. Não oficial, sem vínculo com a Força Aérea Brasileira.
      </footer>
    </div>
  );
}
