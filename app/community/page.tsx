import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { PostCard } from "@/components/community/post-card"
import { getCommunityPosts } from "@/lib/community-actions"
import { Suspense } from "react"
import Loading from "../loading" // Import the loading component

export const dynamic = "force-dynamic" // Ensure this page is dynamic

export default async function CommunityPage() {
  const posts = await getCommunityPosts()

  return (
    <main className="flex-1 p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Comunidade</h1>
        <Link href="/community/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Post
          </Button>
        </Link>
      </div>
      <Suspense fallback={<Loading />}>
        {posts.length === 0 ? (
          <p className="text-center text-gray-500">Nenhum post na comunidade ainda. Seja o primeiro a criar um!</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard
                key={post.id}
                id={post.id}
                title={post.title}
                content={post.content}
                authorName={post.author_name || "Usuário Desconhecido"}
                categoryName={post.category_name || "Sem Categoria"}
                createdAt={post.created_at}
                tags={post.tags || []}
                likesCount={post.likes_count}
                hasLiked={post.has_liked}
                // Para a contagem de comentários na lista, precisaríamos de uma query separada ou um contador no DB
                // Por enquanto, não passaremos commentCount aqui para evitar N+1 queries
              />
            ))}
          </div>
        )}
      </Suspense>
    </main>
  )
}
