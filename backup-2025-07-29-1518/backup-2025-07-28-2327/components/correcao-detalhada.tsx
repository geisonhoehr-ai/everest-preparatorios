"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileText, 
  Save, 
  Eye, 
  Calculator, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Star,
  MessageSquare,
  Volume2,
  Download,
  ArrowLeft
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AvaliacaoRedacao {
  // PARTE 1: Expressão (0,200 por erro)
  erros_pontuacao: number
  erros_ortografia: number
  erros_caligrafia: number
  erros_vocabulario: number
  erros_acentuacao: number
  erros_morfosintaxe: number
  
  // PARTE 2: Estrutura (0,500 por erro)
  // Introdução
  tema_ok: boolean
  tese_ok: boolean
  desfecho_ok: boolean
  coesao_tema_tese: boolean
  coesao_tese_desfecho: boolean
  
  // Desenvolvimento 1
  dev1_arg1_ok: boolean
  dev1_informatividade_ok: boolean
  dev1_desfecho_ok: boolean
  dev1_coesao_ok: boolean
  
  // Desenvolvimento 2
  dev2_arg2_ok: boolean
  dev2_informatividade_ok: boolean
  dev2_desfecho_ok: boolean
  dev2_coesao_ok: boolean
  
  // Conclusão
  conclusao_retomada_ok: boolean
  conclusao_proposta_ok: boolean
  conclusao_resultado_ok: boolean
  conclusao_coesao_ok: boolean
  
  // PARTE 3: Conteúdo (até 4,5)
  tese_completa: boolean
  modalizador_presente: boolean
  tangenciamento: boolean
  tese_neutra: boolean
  
  arg1_coerente: boolean
  arg1_justifica_tese: boolean
  arg2_coerente: boolean
  arg2_justifica_tese: boolean
  
  informatividade_intro: boolean
  informatividade_dev1: boolean
  informatividade_dev2: boolean
  
  // Feedback
  feedback_geral: string
  sugestoes_melhoria: string
}

interface CorrecaoDetalhadaProps {
  redacaoId: number
  onClose: () => void
}

export function CorrecaoDetalhada({ redacaoId, onClose }: CorrecaoDetalhadaProps) {
  const [avaliacao, setAvaliacao] = useState<AvaliacaoRedacao>({
    // PARTE 1 - Expressão
    erros_pontuacao: 0,
    erros_ortografia: 0,
    erros_caligrafia: 0,
    erros_vocabulario: 0,
    erros_acentuacao: 0,
    erros_morfosintaxe: 0,
    
    // PARTE 2 - Estrutura
    tema_ok: false,
    tese_ok: false,
    desfecho_ok: false,
    coesao_tema_tese: false,
    coesao_tese_desfecho: false,
    
    dev1_arg1_ok: false,
    dev1_informatividade_ok: false,
    dev1_desfecho_ok: false,
    dev1_coesao_ok: false,
    
    dev2_arg2_ok: false,
    dev2_informatividade_ok: false,
    dev2_desfecho_ok: false,
    dev2_coesao_ok: false,
    
    conclusao_retomada_ok: false,
    conclusao_proposta_ok: false,
    conclusao_resultado_ok: false,
    conclusao_coesao_ok: false,
    
    // PARTE 3 - Conteúdo
    tese_completa: false,
    modalizador_presente: false,
    tangenciamento: false,
    tese_neutra: false,
    
    arg1_coerente: false,
    arg1_justifica_tese: false,
    arg2_coerente: false,
    arg2_justifica_tese: false,
    
    informatividade_intro: false,
    informatividade_dev1: false,
    informatividade_dev2: false,
    
    // Feedback
    feedback_geral: "",
    sugestoes_melhoria: ""
  })

  const [loading, setLoading] = useState(false)
  const [redacaoData, setRedacaoData] = useState<any>(null)

  // Dados simulados da redação
  useEffect(() => {
    setRedacaoData({
      id: redacaoId,
      titulo: "Redação sobre Sustentabilidade",
      aluno_nome: "João Silva",
      turma_nome: "3º Ano A",
      tema: "Sustentabilidade no Brasil",
      data_envio: "2024-01-15T10:30:00Z",
      imagens: ["/placeholder-redacao.jpg"]
    })
  }, [redacaoId])

  const calcularNota = () => {
    // PARTE 1: Expressão (0,200 por erro)
    const totalErrosExpressao = 
      avaliacao.erros_pontuacao + 
      avaliacao.erros_ortografia + 
      avaliacao.erros_caligrafia + 
      avaliacao.erros_vocabulario + 
      avaliacao.erros_acentuacao + 
      avaliacao.erros_morfosintaxe
    
    const descontoExpressao = totalErrosExpressao * 0.2
    
    // PARTE 2: Estrutura (0,500 por erro)
    const errosEstrutura = [
      !avaliacao.tema_ok, !avaliacao.tese_ok, !avaliacao.desfecho_ok,
      !avaliacao.coesao_tema_tese, !avaliacao.coesao_tese_desfecho,
      !avaliacao.dev1_arg1_ok, !avaliacao.dev1_informatividade_ok, !avaliacao.dev1_desfecho_ok, !avaliacao.dev1_coesao_ok,
      !avaliacao.dev2_arg2_ok, !avaliacao.dev2_informatividade_ok, !avaliacao.dev2_desfecho_ok, !avaliacao.dev2_coesao_ok,
      !avaliacao.conclusao_retomada_ok, !avaliacao.conclusao_proposta_ok, !avaliacao.conclusao_resultado_ok, !avaliacao.conclusao_coesao_ok
    ].filter(Boolean).length
    
    const descontoEstrutura = errosEstrutura * 0.5
    
    // PARTE 3: Conteúdo (até 4,5)
    let descontoConteudo = 0
    
    // Pertinência ao tema (até 1,5)
    if (!avaliacao.tese_completa) descontoConteudo += 0.5
    if (!avaliacao.modalizador_presente) descontoConteudo += 0.5
    if (avaliacao.tangenciamento) descontoConteudo += 0.5
    
    // Argumentação (até 1,5)
    if (!avaliacao.arg1_coerente) descontoConteudo += 0.5
    if (!avaliacao.arg2_coerente) descontoConteudo += 0.5
    if (!avaliacao.arg1_justifica_tese) descontoConteudo += 0.25
    if (!avaliacao.arg2_justifica_tese) descontoConteudo += 0.25
    
    // Informatividade (até 1,5)
    if (!avaliacao.informatividade_intro) descontoConteudo += 0.5
    if (!avaliacao.informatividade_dev1) descontoConteudo += 0.5
    if (!avaliacao.informatividade_dev2) descontoConteudo += 0.5
    
    const notaFinal = 10 - descontoExpressao - descontoEstrutura - descontoConteudo
    
    return {
      nota: Math.max(0, notaFinal).toFixed(3),
      descontoExpressao: descontoExpressao.toFixed(3),
      descontoEstrutura: descontoEstrutura.toFixed(3),
      descontoConteudo: descontoConteudo.toFixed(3),
      totalErrosExpressao,
      errosEstrutura
    }
  }

  const handleSalvarCorrecao = async () => {
    setLoading(true)
    try {
      const notaCalculada = calcularNota()
      console.log("Salvando correção:", { avaliacao, notaCalculada })
      
      // Salvar no banco de dados
      const response = await fetch('/api/avaliacoes-redacao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          redacao_id: redacaoId,
          ...avaliacao,
          feedback_geral: avaliacao.feedback_geral || '',
          sugestoes_melhoria: avaliacao.sugestoes_melhoria || ''
        }),
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar avaliação')
      }

      const result = await response.json()
      console.log("Avaliação salva:", result)
      onClose()
    } catch (error) {
      console.error("Erro ao salvar correção:", error)
      alert("Erro ao salvar correção. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const notaCalculada = calcularNota()

  if (!redacaoData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Correção de Redação - CIAAR 2025</h1>
            <p className="text-muted-foreground">
              {redacaoData.aluno_nome} • {redacaoData.turma_nome} • {redacaoData.tema}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-blue-600">{notaCalculada.nota}</div>
          <div className="text-sm text-muted-foreground">Nota Final</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Lado esquerdo - Redação do aluno */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Redação do Aluno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 h-[600px] overflow-auto bg-gray-50">
              <div className="text-center text-muted-foreground py-8">
                <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p>Visualizador de PDF da redação</p>
                <p className="text-sm">Aqui seria exibida a redação do aluno</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lado direito - Formulário de correção */}
        <div className="space-y-6">
          {/* Resumo da Nota */}
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5 text-blue-600" />
                Resumo da Avaliação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Expressão:</span>
                  <span className="text-red-600 ml-2">-{notaCalculada.descontoExpressao}</span>
                  <div className="text-xs text-muted-foreground">
                    {notaCalculada.totalErrosExpressao} erros
                  </div>
                </div>
                <div>
                  <span className="font-medium">Estrutura:</span>
                  <span className="text-red-600 ml-2">-{notaCalculada.descontoEstrutura}</span>
                  <div className="text-xs text-muted-foreground">
                    {notaCalculada.errosEstrutura} erros
                  </div>
                </div>
                <div>
                  <span className="font-medium">Conteúdo:</span>
                  <span className="text-red-600 ml-2">-{notaCalculada.descontoConteudo}</span>
                </div>
                <div>
                  <span className="font-medium">Nota Final:</span>
                  <span className="text-blue-600 font-bold ml-2">{notaCalculada.nota}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* PARTE 1 - EXPRESSÃO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                PARTE 1 - Expressão (0,200 por erro)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pontuação</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={avaliacao.erros_pontuacao}
                    onChange={(e) => setAvaliacao(prev => ({
                      ...prev, 
                      erros_pontuacao: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Ortografia</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={avaliacao.erros_ortografia}
                    onChange={(e) => setAvaliacao(prev => ({
                      ...prev, 
                      erros_ortografia: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Caligrafia</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={avaliacao.erros_caligrafia}
                    onChange={(e) => setAvaliacao(prev => ({
                      ...prev, 
                      erros_caligrafia: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Vocabulário</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={avaliacao.erros_vocabulario}
                    onChange={(e) => setAvaliacao(prev => ({
                      ...prev, 
                      erros_vocabulario: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Acentuação</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={avaliacao.erros_acentuacao}
                    onChange={(e) => setAvaliacao(prev => ({
                      ...prev, 
                      erros_acentuacao: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Morfosintaxe</label>
                  <Input 
                    type="number" 
                    min="0"
                    value={avaliacao.erros_morfosintaxe}
                    onChange={(e) => setAvaliacao(prev => ({
                      ...prev, 
                      erros_morfosintaxe: parseInt(e.target.value) || 0
                    }))}
                    className="mt-1"
                  />
                </div>
              </div>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <strong className="text-red-700">
                  Desconto: -{notaCalculada.descontoExpressao}
                </strong>
              </div>
            </CardContent>
          </Card>

          {/* PARTE 2 - ESTRUTURA */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                PARTE 2 - Estrutura (0,500 por erro)
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Introdução */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-blue-600">Introdução</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.tema_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, tema_ok: checked as boolean}))}
                    />
                    <label className="text-sm">TEMA: ok</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.tese_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, tese_ok: checked as boolean}))}
                    />
                    <label className="text-sm">TESE: ok</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.desfecho_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, desfecho_ok: checked as boolean}))}
                    />
                    <label className="text-sm">ARGs./DESFECHO: ok</label>
                  </div>
                </div>
              </div>

              {/* Desenvolvimento 1 */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-green-600">Desenvolvimento 1</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.dev1_arg1_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, dev1_arg1_ok: checked as boolean}))}
                    />
                    <label className="text-sm">ARG 1: ok</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.dev1_informatividade_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, dev1_informatividade_ok: checked as boolean}))}
                    />
                    <label className="text-sm">Informatividade: ok</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.dev1_desfecho_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, dev1_desfecho_ok: checked as boolean}))}
                    />
                    <label className="text-sm">Desfecho: ok</label>
                  </div>
                </div>
              </div>

              {/* Desenvolvimento 2 */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-green-600">Desenvolvimento 2</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.dev2_arg2_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, dev2_arg2_ok: checked as boolean}))}
                    />
                    <label className="text-sm">ARG 2: ok</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.dev2_informatividade_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, dev2_informatividade_ok: checked as boolean}))}
                    />
                    <label className="text-sm">Informatividade: ok</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.dev2_desfecho_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, dev2_desfecho_ok: checked as boolean}))}
                    />
                    <label className="text-sm">Desfecho: ok</label>
                  </div>
                </div>
              </div>

              {/* Conclusão */}
              <div className="mb-4">
                <h4 className="font-medium mb-3 text-purple-600">Conclusão</h4>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.conclusao_retomada_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, conclusao_retomada_ok: checked as boolean}))}
                    />
                    <label className="text-sm">Retomada TEMA/TESE: ok</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.conclusao_proposta_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, conclusao_proposta_ok: checked as boolean}))}
                    />
                    <label className="text-sm">Proposta: ok</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      checked={avaliacao.conclusao_resultado_ok}
                      onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, conclusao_resultado_ok: checked as boolean}))}
                    />
                    <label className="text-sm">Resultado: ok</label>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <strong className="text-yellow-700">
                  Desconto: -{notaCalculada.descontoEstrutura}
                </strong>
              </div>
            </CardContent>
          </Card>

          {/* PARTE 3 - CONTEÚDO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-purple-600" />
                PARTE 3 - Conteúdo (até 4,5)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-3 text-blue-600">Pertinência ao Tema (até 1,5)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={avaliacao.tese_completa}
                        onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, tese_completa: checked as boolean}))}
                      />
                      <label className="text-sm">TESE COMPLETA: ok</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={avaliacao.modalizador_presente}
                        onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, modalizador_presente: checked as boolean}))}
                      />
                      <label className="text-sm">MODALIZADOR (advérbio/adjetivo): ok</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-green-600">Argumentação Coerente (até 1,5)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={avaliacao.arg1_coerente}
                        onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, arg1_coerente: checked as boolean}))}
                      />
                      <label className="text-sm">ARG 1: ok</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={avaliacao.arg2_coerente}
                        onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, arg2_coerente: checked as boolean}))}
                      />
                      <label className="text-sm">ARG 2: ok</label>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3 text-purple-600">Informatividade (até 1,5)</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={avaliacao.informatividade_intro}
                        onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, informatividade_intro: checked as boolean}))}
                      />
                      <label className="text-sm">INTRODUÇÃO: ok</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={avaliacao.informatividade_dev1}
                        onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, informatividade_dev1: checked as boolean}))}
                      />
                      <label className="text-sm">DES 1: ok</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={avaliacao.informatividade_dev2}
                        onCheckedChange={(checked) => setAvaliacao(prev => ({...prev, informatividade_dev2: checked as boolean}))}
                      />
                      <label className="text-sm">DES 2: ok</label>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Presença de: Alusão histórica / Dados / Filosofia / Exemplos / Analogias / Artes / Geografia
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <strong className="text-purple-700">
                  Desconto: -{notaCalculada.descontoConteudo}
                </strong>
              </div>
            </CardContent>
          </Card>

          {/* Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Feedback e Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea 
                placeholder="Informações complementares e laudo do avaliador..."
                value={avaliacao.feedback_geral}
                onChange={(e) => setAvaliacao(prev => ({...prev, feedback_geral: e.target.value}))}
                className="min-h-32"
              />
            </CardContent>
          </Card>

          {/* Botões de ação */}
          <div className="flex gap-4">
            <Button 
              onClick={handleSalvarCorrecao}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Finalizar Correção
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 