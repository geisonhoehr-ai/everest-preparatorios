"use client"

import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { MessageCircle, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toggleLike } from "@/lib/community-actions"
import { useTransition } from "react"
import { cn } from "@/lib/utils"

interface PostCardProps {
  id: string
  title: string
  content: string
  authorName: string
  categoryName: string
  createdAt: string
  tags: string[]
  commentCount?: number
  likesCount?: number
  hasLiked?: boolean
}

export function PostCard({
  id,
  title,
  content,
  authorName,
  categoryName,
  createdAt,
  tags,
  commentCount,
  likesCount,
  hasLiked,
}: PostCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleLike = () => {
    startTransition(async () => {
      await toggleLike(id)
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <Link href={`/community/${id}`}>
            <CardTitle className="text-xl hover:underline cursor-pointer">{title}</CardTitle>
          </Link>
          <Badge variant="secondary">{categoryName}</Badge>
        </div>
        <CardDescription className="text-sm text-gray-500">
          Por {authorName} • {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 line-clamp-3 whitespace-pre-wrap">{content}</p>
        {tags && tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                #{tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLike}
          disabled={isPending}
          className={cn("flex items-center gap-1", hasLiked && "text-blue-600 hover:text-blue-700")}
        >
          <ThumbsUp className={cn("w-4 h-4", hasLiked && "fill-blue-600")} />
          {likesCount || 0} Curtidas
        </Button>
        {commentCount !== undefined && (
          <Link href={`/community/${id}#comments`} className="flex items-center text-sm text-gray-500 hover:underline">
            <MessageCircle className="w-4 h-4 mr-1" />
            {commentCount} Comentários
          </Link>
        )}
      </CardFooter>
    </Card>
  )
}
