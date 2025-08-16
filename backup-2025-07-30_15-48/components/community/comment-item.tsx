import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface CommentItemProps {
  authorName: string
  content: string
  createdAt: string
}

export function CommentItem({ authorName, content, createdAt }: CommentItemProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardDescription className="text-sm text-gray-500">
          Por {authorName} • {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: ptBR })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-gray-700 whitespace-pre-wrap">{content}</p>
      </CardContent>
    </Card>
  )
}
