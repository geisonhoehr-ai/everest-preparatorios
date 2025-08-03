import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)]">
      <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
      <p className="mt-4 text-gray-500">Carregando...</p>
    </div>
  )
}
