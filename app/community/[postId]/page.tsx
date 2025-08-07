import { Suspense } from "react"
import { getCommunityPostById, getCommunityCommentsByPostId } from "@/lib/community-actions"
import { CommentForm } from "@/components/community/comment-form"
import { CommentItem } from "@/components/community/comment-item"
import Loading from "../../loading" // Import the loading component
import { PostCard } from "@/components/community/post-card" // Reutilizando PostCard para o cabeçalho

export const dynamic = "force-dynamic" // Ensure this page is dynamic

interface PostPageProps {
  params: Promise<{
    postId: string
  }>
}

export default async function CommunityPostPage({ params }: PostPageProps) {
  const { postId } = await params
  const post = await getCommunityPostById(postId)
  const comments = await getCommunityCommentsByPostId(postId)

  if (!post) {
    return (
      <main className="flex-1 p-4 md:p-6 text-center text-gray-500">
        <h1 className="text-2xl font-bold mb-4">Post Não Encontrado</h1>
        <p>O post que você está procurando pode ter sido removido ou não existe.</p>
      </main>
    )
  }

  return (
    <main className="flex-1 p-4 md:p-6">
      <Suspense fallback={<Loading />}>
        {/* Reutilizando PostCard para exibir o post principal com curtidas e tags */}
        <div className="w-full max-w-3xl mx-auto mb-6">
          <PostCard
            id={post.id}
            title={post.title}
            content={post.content}
            authorName={post.author_name || "Usuário Desconhecido"}
            categoryName={post.category_name || "Sem Categoria"}
            createdAt={post.created_at}
            tags={post.tags || []}
            likesCount={post.likes_count}
            hasLiked={post.has_liked}
            commentCount={comments.length} // Passa a contagem de comentários para o PostCard
          />
        </div>

        <div className="w-full max-w-3xl mx-auto space-y-4">
          <h2 className="text-xl font-bold">Comentários ({comments.length})</h2>
          <CommentForm postId={postId} />
          {comments.length === 0 ? (
            <p className="text-gray-500">Nenhum comentário ainda. Seja o primeiro a comentar!</p>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  authorName={comment.author_name || "Usuário Desconhecido"}
                  content={comment.content}
                  createdAt={comment.created_at}
                />
              ))}
            </div>
          )}
        </div>
      </Suspense>
    </main>
  )
}
