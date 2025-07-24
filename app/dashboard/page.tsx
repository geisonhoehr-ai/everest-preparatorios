"use client";

import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-[#18181b] to-[#23272f] text-white px-4 py-8">
      <header className="w-full max-w-4xl flex flex-col items-center mt-8 mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2 tracking-tight">
          Bem-vindo ao seu Painel, Aluno Everest!
        </h1>
        <h2 className="text-lg md:text-xl font-medium text-center text-primary mb-2">
          Aqui você acompanha seu progresso e acessa tudo da plataforma.
        </h2>
      </header>
      <main className="flex flex-col items-center gap-8 w-full max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6 w-full">
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">📚</span>
            <h3 className="font-bold text-lg mb-1">Meus Flashcards</h3>
            <p className="text-gray-400 text-center text-sm mb-2">Continue revisando e avance no seu aprendizado.</p>
            <Link href="/flashcards" className="text-primary font-bold hover:underline">Acessar Flashcards</Link>
          </div>
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">✍️</span>
            <h3 className="font-bold text-lg mb-1">Minhas Redações</h3>
            <p className="text-gray-400 text-center text-sm mb-2">Envie, acompanhe e veja o feedback das suas redações.</p>
            <Link href="/redacao" className="text-primary font-bold hover:underline">Acessar Redações</Link>
          </div>
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">📝</span>
            <h3 className="font-bold text-lg mb-1">Simulados</h3>
            <p className="text-gray-400 text-center text-sm mb-2">Teste seus conhecimentos com simulados exclusivos.</p>
            <Link href="/quiz" className="text-primary font-bold hover:underline">Acessar Simulados</Link>
          </div>
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">👥</span>
            <h3 className="font-bold text-lg mb-1">Comunidade</h3>
            <p className="text-gray-400 text-center text-sm mb-2">Participe, tire dúvidas e interaja com outros alunos.</p>
            <Link href="/community" className="text-primary font-bold hover:underline">Acessar Comunidade</Link>
          </div>
        </div>
        <div className="w-full max-w-2xl mt-8">
          <div className="bg-[#23272f] rounded-lg p-6 shadow flex flex-col items-center">
            <span className="text-3xl mb-2">🏆</span>
            <h3 className="font-bold text-lg mb-1">Seu Progresso</h3>
            <p className="text-gray-400 text-center text-sm mb-2">Acompanhe seu desempenho, ranking e evolução na plataforma.</p>
            <Link href="/profile" className="text-primary font-bold hover:underline">Ver Perfil e Ranking</Link>
          </div>
        </div>
      </main>
    </div>
  );
} 