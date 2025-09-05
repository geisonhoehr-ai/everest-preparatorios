"use client"

import { AdminOnly } from "@/components/role-guard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Crown } from "lucide-react"

export default function MembrosPage() {
  return (
    <AdminOnly>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
            <Crown className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gerenciar Membros
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Área restrita para administradores
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Lista de Membros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Funcionalidade em Desenvolvimento
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Esta página está disponível apenas para administradores.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminOnly>
  )
}
