"use client"

import { TeacherOnly } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, PenTool } from "lucide-react"

export default function RedacaoPage() {
  return (
    <TeacherOnly>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Redação
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Área para professores e administradores
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenTool className="h-5 w-5" />
              Gerenciar Redações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Funcionalidade em Desenvolvimento
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Esta página está disponível para professores e administradores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </TeacherOnly>
  )
}
