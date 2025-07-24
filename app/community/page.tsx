import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { PostCard } from "@/components/community/post-card"
import { getCommunityPosts } from "@/lib/community-actions"
import { Suspense } from "react"
import Loading from "../loading"
import CommunitySidebar from "@/components/community/sidebar"
import { SiteHeader } from "@/components/site-header"

export const dynamic = "force-dynamic"

export default async function CommunityPage() {
  const posts = await getCommunityPosts()
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-screen">
        <CommunitySidebar />
        <main className="flex-1 container py-8">
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
                  />
                ))}
              </div>
            )}
          </Suspense>
        </main>
      </div>
    </>
  )
}
