"use client";

import { useState, useEffect } from "react";
import { 
  FileText, 
  PenTool, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Users,
  Calendar,
  TrendingUp,
  AlertCircle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PagePermissionGuard } from "@/components/page-permission-guard";

import { useAuth } from "@/context/auth-context-custom";
import { useRouter } from "next/navigation";
import { 
  getActiveEssayPrompts, 
  getStudentEssays, 
  getPendingEssays 
} from "@/app/server-actions";

interface EssayPrompt {
  id: string;
  title: string;
  description: string;
  suggested_repertoire?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  subjects?: { name: string };
}

interface Essay {
  id: string;
  title: string;
  submission_text: string;
  submission_date: string;
  status: string;
  final_grade?: number;
  teacher_feedback_text?: string;
  essay_prompts?: { title: string; description: string };
  users?: { name: string; email: string };
}

export default function RedacaoPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [prompts, setPrompts] = useState<EssayPrompt[]>([]);
  const [studentEssays, setStudentEssays] = useState<Essay[]>([]);
  const [pendingEssays, setPendingEssays] = useState<Essay[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [promptsData, essaysData, pendingData] = await Promise.all([
        getActiveEssayPrompts(),
        user?.role === 'student' ? getStudentEssays(user.id) : Promise.resolve([]),
        user?.role === 'teacher' || user?.role === 'administrator' ? getPendingEssays() : Promise.resolve([])
      ]);
      
      setPrompts(promptsData);
      setStudentEssays(essaysData);
      setPendingEssays(pendingData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Verificar se o prompt está ativo no período
  const isPromptActiveInPeriod = (prompt: EssayPrompt) => {
    const now = new Date();
    const startDate = prompt.start_date ? new Date(prompt.start_date) : null;
    const endDate = prompt.end_date ? new Date(prompt.end_date) : null;
    
    if (!prompt.is_active) return false;
    if (startDate && now < startDate) return false;
    if (endDate && now > endDate) return false;
    
    return true;
  };

  // Obter status da redação
  const getEssayStatus = (status: string) => {
    switch (status) {
      case 'pending':
        return { label: 'Aguardando Correção', color: 'bg-yellow-500', icon: Clock };
      case 'correcting':
        return { label: 'Em Correção', color: 'bg-blue-500', icon: PenTool };
      case 'corrected':
        return { label: 'Corrigida', color: 'bg-green-500', icon: CheckCircle };
      case 'rejected':
        return { label: 'Rejeitada', color: 'bg-red-500', icon: AlertCircle };
      default:
        return { label: status, color: 'bg-gray-500', icon: FileText };
    }
  };

  // Funções de navegação
  const handleWriteEssay = (promptId: string) => {
    router.push(`/redacao/escrever/${promptId}`);
  };

  const handleViewEssayDetails = (essayId: string) => {
    router.push(`/redacao/detalhes/${essayId}`);
  };

  const handleCorrectEssay = (essayId: string) => {
    router.push(`/redacao/corrigir/${essayId}`);
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <PagePermissionGuard pageName="redacao">
      <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Cabeçalho da Página */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Redação
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {user?.role === 'student' 
            ? "Escolha um tema e pratique sua redação" 
            : "Gerencie redações e correções"
          }
        </p>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Temas Disponíveis
            </CardTitle>
            <BookOpen className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {prompts.filter(isPromptActiveInPeriod).length}
            </div>
          </CardContent>
        </Card>

        {user?.role === 'student' && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Redações Enviadas
              </CardTitle>
              <FileText className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentEssays.length}
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === 'student' && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Redações Corrigidas
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentEssays.filter(e => e.status === 'corrected').length}
              </div>
            </CardContent>
          </Card>
        )}

        {(user?.role === 'teacher' || user?.role === 'administrator') && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Aguardando Correção
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {pendingEssays.length}
              </div>
            </CardContent>
          </Card>
        )}

        {user?.role === 'student' && studentEssays.length > 0 && (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Média das Notas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {studentEssays
                  .filter(e => e.final_grade !== null && e.final_grade !== undefined)
                  .reduce((acc, e) => acc + (e.final_grade || 0), 0) / 
                  studentEssays.filter(e => e.final_grade !== null && e.final_grade !== undefined).length || 0
                }
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Conteúdo Principal */}
      <Tabs defaultValue={user?.role === 'student' ? "temas" : "correcoes"} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <TabsTrigger value="temas" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
            Temas de Redação
          </TabsTrigger>
          {user?.role === 'student' && (
            <TabsTrigger value="minhas-redacoes" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Minhas Redações
            </TabsTrigger>
          )}
          {(user?.role === 'teacher' || user?.role === 'administrator') && (
            <TabsTrigger value="correcoes" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
              Correções
            </TabsTrigger>
          )}
        </TabsList>

        {/* Tab: Temas de Redação */}
        <TabsContent value="temas" className="space-y-6">
          <div className="grid gap-6">
            {prompts.length === 0 ? (
              <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <CardContent className="text-center py-12">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Nenhum tema disponível
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Não há temas de redação disponíveis no momento.
                  </p>
                </CardContent>
              </Card>
            ) : (
              prompts.map((prompt) => (
                <Card 
                  key={prompt.id} 
                  className={`bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-lg ${
                    isPromptActiveInPeriod(prompt) 
                      ? 'hover:border-orange-300 dark:hover:border-orange-600' 
                      : 'opacity-60'
                  }`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                          <FileText className="h-5 w-5 text-orange-500" />
                          {prompt.title}
                        </CardTitle>
                        {prompt.subjects && (
                          <Badge variant="outline" className="mb-3 border-orange-200 text-orange-700 dark:border-orange-800 dark:text-orange-300">
                            {prompt.subjects.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge 
                          variant={isPromptActiveInPeriod(prompt) ? "default" : "secondary"}
                          className={isPromptActiveInPeriod(prompt) ? "bg-green-500 hover:bg-green-600" : ""}
                        >
                          {isPromptActiveInPeriod(prompt) ? 'Ativo' : 'Inativo'}
                        </Badge>
                        {prompt.start_date && prompt.end_date && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(prompt.start_date)} - {formatDate(prompt.end_date)}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Enunciado:</h4>
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                          {prompt.description}
                        </p>
                      </div>
                      
                      {prompt.suggested_repertoire && (
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Repertório Sugerido:</h4>
                          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                            {prompt.suggested_repertoire}
                          </p>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                          disabled={!isPromptActiveInPeriod(prompt)}
                          onClick={() => {
                            if (user?.role === 'student') {
                              handleWriteEssay(prompt.id);
                            } else {
                              handleViewEssayDetails(prompt.id);
                            }
                          }}
                        >
                          {user?.role === 'student' ? 'Escrever Redação' : 'Ver Detalhes'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        {/* Tab: Minhas Redações (Estudante) */}
        {user?.role === 'student' && (
          <TabsContent value="minhas-redacoes" className="space-y-6">
            <div className="grid gap-6">
              {studentEssays.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="text-center py-12">
                    <PenTool className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma redação enviada
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Você ainda não enviou nenhuma redação. Escolha um tema e comece a praticar!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                studentEssays.map((essay) => {
                  const statusInfo = getEssayStatus(essay.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <Card 
                      key={essay.id} 
                      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600"
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-xl text-gray-900 dark:text-white mb-2">
                              {essay.essay_prompts?.title || 'Redação'}
                            </CardTitle>
                            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Enviada em {formatDate(essay.submission_date)}
                              </div>
                              {essay.final_grade !== null && essay.final_grade !== undefined && (
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  Nota: {essay.final_grade.toFixed(1)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={`${statusInfo.color} text-white`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusInfo.label}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Sua Redação:</h4>
                            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-3">
                              {essay.submission_text}
                            </p>
                          </div>
                          
                          {essay.status === 'corrected' && essay.teacher_feedback_text && (
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Feedback do Professor:</h4>
                              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-3">
                                {essay.teacher_feedback_text}
                              </p>
                            </div>
                          )}
                          
                          <div className="flex justify-end">
                            <Button 
                              className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                              onClick={() => handleViewEssayDetails(essay.id)}
                            >
                              Ver Detalhes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </TabsContent>
        )}

        {/* Tab: Correções (Professor/Admin) */}
        {(user?.role === 'teacher' || user?.role === 'administrator') && (
          <TabsContent value="correcoes" className="space-y-6">
            <div className="grid gap-6">
              {pendingEssays.length === 0 ? (
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardContent className="text-center py-12">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                      Nenhuma redação pendente
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Todas as redações foram corrigidas! Ótimo trabalho!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                pendingEssays.map((essay) => (
                  <Card 
                    key={essay.id} 
                    className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:border-orange-300 dark:hover:border-orange-600"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl text-gray-900 dark:text-white mb-2">
                            {essay.essay_prompts?.title || 'Redação'}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {essay.users?.name || 'Aluno'}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              Enviada em {formatDate(essay.submission_date)}
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-yellow-500 text-white">
                          <Clock className="h-3 w-3 mr-1" />
                          Aguardando Correção
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Redação do Aluno:</h4>
                          <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap line-clamp-3">
                            {essay.submission_text}
                          </p>
                        </div>
                        
                        <div className="flex justify-end">
                          <Button 
                            className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                            onClick={() => handleCorrectEssay(essay.id)}
                          >
                            Corrigir Redação
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
      </div>
    </PagePermissionGuard>
  );
}
