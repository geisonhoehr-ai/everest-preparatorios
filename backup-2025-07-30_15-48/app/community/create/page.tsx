import { Suspense } from "react"
import { CreatePostForm } from "@/components/community/create-post-form"
import Loading from "../loading" // Import the loading component

export const dynamic = "force-dynamic" // Ensure this page is dynamic

export default function CreateCommunityPostPage() {
  return (
    <main className="flex-1 p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">Criar Novo Post na Comunidade</h1>
      <Suspense fallback={<Loading />}>
        <CreatePostForm />
      </Suspense>
    </main>
  )
}
