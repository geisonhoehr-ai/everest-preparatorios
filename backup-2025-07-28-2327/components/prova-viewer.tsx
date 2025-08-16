"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Clock, FileText, BookOpen } from 'lucide-react'

interface Questao {
  id: string;
  tipo: 'multipla_escolha' | 'dissertativa' | 'verdadeiro_falso' | 'completar' | 'associacao' | 'ordenacao';
  enunciado: string;
  pontuacao: number;
  ordem: number;
  opcoes?: any[];
  explicacao?: string;
}

interface Prova {
  id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: 'facil' | 'medio' | 'dificil';
  tempo_limite: number;
  tentativas_permitidas: number;
  nota_minima: number;
  status: 'rascunho' | 'publicada' | 'arquivada';
  criado_por: string;
  criado_em: string;
  texto_base?: string;
  tem_texto_base?: boolean;
  titulo_texto_base?: string;
  fonte_texto_base?: string;
  questoes?: Questao[];
}

interface ProvaViewerProps {
  prova: Prova;
  onIniciarProva: () => void;
}

export function ProvaViewer({ prova, onIniciarProva }: ProvaViewerProps) {
  const [showTextoBase, setShowTextoBase] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header da Prova */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">{prova.titulo}</CardTitle>
              <p className="text-muted-foreground mt-2">{prova.descricao}</p>
            </div>
            <Badge variant="secondary">{prova.materia}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{prova.tempo_limite} minutos</span>
            </div>
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              <span>{prova.questoes?.length || 0} questões</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              <span>Nota mínima: {prova.nota_minima}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Texto Base (se existir) */}
      {prova.tem_texto_base && prova.texto_base && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">
                {prova.titulo_texto_base || 'Texto Base'}
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTextoBase(!showTextoBase)}
              >
                {showTextoBase ? 'Ocultar' : 'Mostrar'} Texto
              </Button>
            </div>
          </CardHeader>
          {showTextoBase && (
            <CardContent>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: prova.texto_base }}
              />
              {prova.fonte_texto_base && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    <strong>Fonte:</strong> {prova.fonte_texto_base}
                  </p>
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Lista de Questões */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Questões da Prova</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {prova.questoes?.map((questao, index) => (
              <div key={questao.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="outline">Questão {index + 1}</Badge>
                  <Badge variant="secondary">{questao.pontuacao} pontos</Badge>
                </div>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: questao.enunciado }}
                />
                <div className="mt-2 text-sm text-muted-foreground">
                  Tipo: {questao.tipo.replace('_', ' ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Botão para Iniciar Prova */}
      <div className="flex justify-center">
        <Button size="lg" onClick={onIniciarProva}>
          Iniciar Prova
        </Button>
      </div>
    </div>
  )
}