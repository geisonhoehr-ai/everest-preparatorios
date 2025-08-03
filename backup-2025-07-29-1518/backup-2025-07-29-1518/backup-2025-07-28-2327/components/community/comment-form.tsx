"use client"

import type React from "react"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { createCommunityComment } from "@/lib/community-actions"

interface CommentFormProps {
  postId: string
}

export function CommentForm({ postId }: CommentFormProps) {
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState("")
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      const formData = new FormData()
      formData.append("postId", postId)
      formData.append("content", content)

      const result = await createCommunityComment(formData)

      if (result.success) {
        toast({
          title: "Sucesso!",
          description: result.message,
        })
        setContent("") // Limpa o campo após o envio
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
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg shadow-sm" id="comments">
      <Textarea
        id="comment-content"
        placeholder="Adicione seu comentário aqui..."
        rows={4}
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isPending}
      />
      <p className="text-sm text-gray-500">
        Dica: Use o seletor de emojis do seu sistema operacional (Windows: `Win + .` ou `Win + ;` | macOS: `Cmd + Ctrl +
        Space`) para adicionar emojis.
      </p>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Enviando Comentário...
          </>
        ) : (
          "Adicionar Comentário"
        )}
      </Button>
    </form>
  )
}
