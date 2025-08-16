"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createCommunityPost } from "@/lib/community-actions"
import type { CommunityCategory } from "@/lib/types"

interface CreatePostFormProps {
  categories: CommunityCategory[]
}

export function CreatePostForm({ categories }: CreatePostFormProps) {
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [tags, setTags] = useState("") // Estado para tags
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("content", content)
      formData.append("tags", tags) // Adiciona tags ao FormData

      const result = await createCommunityPost(formData)

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        })
        router.push("/community")
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="space-y-2">
        <Label htmlFor="title">Título do Post</Label>
        <Input
          id="title"
          type="text"
          placeholder="Digite o título do seu post"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Conteúdo</Label>
        <Textarea
          id="content"
          placeholder="Escreva o conteúdo do seu post aqui..."
          rows={8}
          required
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isPending}
        />
        <p className="text-sm text-gray-500">
          Dica: Use o seletor de emojis do seu sistema operacional (Windows: `Win + .` ou `Win + ;` | macOS: `Cmd + Ctrl
          + Space`) para adicionar emojis.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
        <Input
          id="tags"
          type="text"
          placeholder="ex: ciaar, eaof, dúvidas, carreira"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isPending}
        />
        <p className="text-sm text-gray-500">Adicione palavras-chave para ajudar outros a encontrar seu post.</p>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Criando Post...
          </>
        ) : (
          "Criar Post"
        )}
      </Button>
      <Button type="button" variant="outline" className="w-full mt-2" onClick={() => router.push("/community")}>Cancelar</Button>
    </form>
  )
}
