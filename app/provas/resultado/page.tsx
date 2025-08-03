"use client";

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Trophy, 
  FileText,
  ArrowLeft,
  Download,
  Share2
} from "lucide-react"
import { useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface ResultadoQuestao {
  id: string;
  enunciado: string;
  tipo: string;
  pontuacao: number;
  resposta_aluno: string;
  resposta_correta: string;
  acertou: boolean;
  pontos_obtidos: number;
  explicacao?: string;
}

interface ResultadoProva {
  id: string;
  titulo: string;
  nota_final: number;
  tempo_gasto: number;
  questoes_corrigidas: ResultadoQuestao[];
  total_questoes: number;
  acertos: number;
  erros: number;
  percentual_acerto: number;
  status: 'aprovado' | 'reprovado';
}

export default function ResultadoProvaPage() {
  const [resultado, setResultado] = useState<ResultadoProva | null>(null)
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const tentativaId = searchParams.get('tentativa_id')
  
  const supabase = createClient()

  useEffect(() => {
    if (tentativaId) {
      carregarResultado(tentativaId)
    }
  }, [tentativaId])

  const carregarResultado = async (id: string) => {
    try {
      setLoading(true)
      
      // Simular carregamento do resultado (substitua pela chamada real da API)
      const resultadoSimulado: ResultadoProva = {
        id: id,
        titulo: "Prova de Português - Interpretação de Texto",
        nota_final: 8.5,
        tempo_gasto: 2700, // 45 minutos em segundos
        questoes_corrigidas: [
          {
            id: "1",
            enunciado: "Qual é o tema principal do texto?",
            tipo: "multipla_escolha",
            pontuacao: 2,
            resposta_aluno: "A importância da leitura",
            resposta_correta: "A importância da leitura",
            acertou: true,
            pontos_obtidos: 2,
            explicacao: "Excelente! Você identificou corretamente o tema central do texto."
          },
          {
            id: "2",
            enunciado: "O autor defende que a tecnologia substitui completamente a leitura tradicional.",
            tipo: "verdadeiro_falso",
            pontuacao: 1,
            resposta_aluno: "Falso",
            resposta_correta: "Falso",
            acertou: true,
            pontos_obtidos: 1,
            explicacao: "Correto! O autor não defende essa posição."
          },
          {
            id: "3",
            enunciado: "Desenvolva uma argumentação sobre a importância da leitura na formação do indivíduo.",
            tipo: "dissertativa",
            pontuacao: 3,
            resposta_aluno: "A leitura é fundamental para o desenvolvimento intelectual...",
            resposta_correta: "Resposta modelo disponível para o professor",
            acertou: true,
            pontos_obtidos: 2.5,
            explicacao: "Boa argumentação! Pontos fortes na estrutura e conteúdo."
          }
        ],
        total_questoes: 3,
        acertos: 3,
        erros: 0,
        percentual_acerto: 100,
        status: 'aprovado'
      }
      
      setResultado(resultadoSimulado)
    } catch (error) {
      console.error('Erro ao carregar resultado:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatarTempo = (segundos: number) => {
    const horas = Math.floor(segundos / 3600)
    const minutos = Math.floor((segundos % 3600) / 60)
    const segs = segundos % 60
    
    if (horas > 0) {
      return `${horas}h ${minutos}m ${segs}s`
    } else if (minutos > 0) {
      return `${minutos}m ${segs}s`
    } else {
      return `${segs}s`
    }
  }

  const getStatusColor = (status: string) => {
    return status === 'aprovado' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  const getStatusText = (status: string) => {
    return status === 'aprovado' ? 'Aprovado' : 'Reprovado'
  }

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
            <p className="mt-4 text-lg">Carregando resultado...</p>
          </div>
        </div>
      </DashboardShell>
    )
  }

  if (!resultado) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Resultado não encontrado</h2>
            <p className="text-gray-600 mb-4">Não foi possível carregar o resultado da prova.</p>
            <Button onClick={() => window.history.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Resultado da Prova</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {resultado.titulo}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Baixar PDF
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Compartilhar
            </Button>
          </div>
        </div>

        {/* Resumo do Resultado */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                Nota Final
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {resultado.nota_final.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">de 10 pontos</div>
                <Badge className={`mt-2 ${getStatusColor(resultado.status)}`}>
                  {getStatusText(resultado.status)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-green-500" />
                Desempenho
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Acertos:</span>
                  <span className="font-semibold text-green-600">{resultado.acertos}/{resultado.total_questoes}</span>
                </div>
                <div className="flex justify-between">
                  <span>Erros:</span>
                  <span className="font-semibold text-red-600">{resultado.erros}/{resultado.total_questoes}</span>
                </div>
                <Progress value={resultado.percentual_acerto} className="w-full" />
                <div className="text-center text-sm text-gray-600">
                  {resultado.percentual_acerto}% de acerto
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {formatarTempo(resultado.tempo_gasto)}
                </div>
                <div className="text-sm text-gray-600">tempo total</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Questões Corrigidas */}
        <Card>
          <CardHeader>
            <CardTitle>Questões Corrigidas</CardTitle>
            <CardDescription>
              Análise detalhada de cada questão
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {resultado.questoes_corrigidas.map((questao, index) => (
                <div key={questao.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        questao.acertou ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {questao.acertou ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      </div>
                      <div>
                        <h3 className="font-semibold">Questão {index + 1}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {questao.tipo.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {questao.pontos_obtidos}/{questao.pontuacao}
                      </div>
                      <div className="text-sm text-gray-600">pontos</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">Enunciado:</h4>
                      <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded" 
                           dangerouslySetInnerHTML={{ __html: questao.enunciado }} />
                    </div>

                    {questao.tipo === 'multipla_escolha' && (
                      <>
                        <div>
                          <h4 className="font-medium mb-2">Sua resposta:</h4>
                          <div className="text-sm p-2 bg-blue-50 rounded">
                            {questao.resposta_aluno}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Resposta correta:</h4>
                          <div className="text-sm p-2 bg-green-50 rounded">
                            {questao.resposta_correta}
                          </div>
                        </div>
                      </>
                    )}

                    {questao.tipo === 'dissertativa' && (
                      <div>
                        <h4 className="font-medium mb-2">Sua resposta:</h4>
                        <div className="text-sm p-3 bg-blue-50 rounded max-h-32 overflow-y-auto">
                          {questao.resposta_aluno}
                        </div>
                      </div>
                    )}

                    {questao.explicacao && (
                      <div>
                        <h4 className="font-medium mb-2">Explicação:</h4>
                        <div className="text-sm p-3 bg-yellow-50 rounded" 
                             dangerouslySetInnerHTML={{ __html: questao.explicacao }} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Button onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar às Provas
          </Button>
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Ver Prova Completa
          </Button>
        </div>
      </div>
    </DashboardShell>
  )
} 