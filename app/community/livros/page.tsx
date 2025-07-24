import CommunitySidebar from "@/components/community/sidebar";

export default function LivrosPage() {
  return (
    <div className="flex min-h-screen">
      <CommunitySidebar />
      <main className="flex-1 container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Livros e Provas</h1>
        </div>
        <div className="w-full flex justify-center">
          <iframe
            src="https://drive.google.com/embeddedfolderview?id=1Xeq7J2FW0umqbph0ZtGVuO5pZGJLOEtD#grid"
            width="100%"
            height="900"
            style={{ border: "none", minHeight: 400, maxHeight: 900, width: '100%' }}
            allow="autoplay"
            title="Livros e Provas Google Drive"
          ></iframe>
        </div>
      </main>
    </div>
  );
} 