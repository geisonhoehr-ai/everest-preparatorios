"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  HelpCircle, 
  Mail, 
  Phone, 
  MessageSquare, 
  Send,
  Clock,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function SuportePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
          <HelpCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Suporte
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Estamos aqui para ajudar você
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Envie sua Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Nome
                </label>
                <Input placeholder="Seu nome completo" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                  Email
                </label>
                <Input placeholder="seu@email.com" type="email" />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Assunto
              </label>
              <Input placeholder="Qual é o assunto?" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Mensagem
              </label>
              <Textarea 
                placeholder="Descreva sua dúvida ou problema..."
                className="min-h-[120px]"
              />
            </div>
            
            <Button className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white">
              <Send className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </Button>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Outras Formas de Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  suporte@everestpreparatorios.com
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Resposta em até 24 horas
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <Phone className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Telefone</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  (11) 99999-9999
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Segunda a Sexta, 8h às 18h
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">WhatsApp</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  (11) 99999-9999
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500">
                  Atendimento 24/7
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Perguntas Frequentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Como posso acessar os materiais de estudo?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Todos os materiais estão disponíveis na seção "Flashcards" e "Quiz". 
                Basta fazer login e navegar pelas matérias disponíveis.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Posso estudar no celular?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sim! Nossa plataforma é totalmente responsiva e funciona perfeitamente 
                em dispositivos móveis, tablets e computadores.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Como funciona o sistema de ranking?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                O ranking é baseado na sua pontuação nos quizzes e flashcards. 
                Quanto mais você acerta, maior sua pontuação e melhor sua posição.
              </p>
            </div>

            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Posso recuperar minha senha?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Sim, na tela de login clique em "Esqueci minha senha" e siga as instruções 
                enviadas para seu email.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
