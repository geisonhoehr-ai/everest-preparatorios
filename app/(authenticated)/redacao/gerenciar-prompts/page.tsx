"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar,
  FileText,
  Users,
  BookOpen,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import { useAuth } from "@/context/auth-context-custom";
import { 
  getPromptsForTeacher, 
  createPrompt, 
  updatePrompt, 
  togglePromptActiveStatus, 
  deletePrompt,
  getAllSubjects
} from "@/app/server-actions";

// Schema de validação para o formulário de prompt
const promptFormSchema = z.object({
  title: z.string().min(1, "O título é obrigatório.").max(200, "O título deve ter no máximo 200 caracteres."),
  description: z.string().min(1, "O enunciado é obrigatório."),
  suggested_repertoire: z.string().optional(),
  subject_id: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_active: z.boolean().default(true),
});

type PromptFormData = z.infer<typeof promptFormSchema>;

// Template padrão para critérios de avaliação
const defaultEvaluationCriteria = {
  "parts": [
    {
      "name": "PARTE 1: Expressão (Gramática Normativa)",
      "max_deduction_per_error": 0.200,
      "error_types": ["Pontuação", "Ortografia", "Acentuação", "Concordância", "Regência"]
    },
    {
      "name": "PARTE 2: Estrutura",
      "max_deduction_per_error": 0.200,
      "error_types": ["Coesão", "Parágrafo", "Ligação entre parágrafos"]
    },
    {
      "name": "PARTE 3: Conteúdo",
      "max_deduction_total": 2.000,
      "sub_criteria": [
        {
          "name": "Pertinência ao tema",
          "max_deduction": 1.000
        },
        {
          "name": "Argumentação",
          "max_deduction": 0.500
        },
        {
          "name": "Informatividade",
          "max_deduction": 0.500
        }
      ],
      "content_elements": ["Introdução", "Desenvolvimento", "Conclusão", "Repertório sociocultural"]
    }
  ]
};

interface EssayPrompt {
  id: string;
  title: string;
  description: string;
  suggested_repertoire?: string;
  subject_id?: string;
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  evaluation_criteria: any;
  created_by_user_id: string;
  created_at: string;
  subjects?: { name: string };
}

export default function ManagePromptsPage() {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<EssayPrompt[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<EssayPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      title: "",
      description: "",
      suggested_repertoire: "",
      subject_id: "",
      start_date: "",
      end_date: "",
      is_active: true,
    },
  });

  // Carregar dados iniciais
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [promptsData, subjectsData] = await Promise.all([
        getPromptsForTeacher(user?.role === 'administrator' ? undefined : user?.id),
        getAllSubjects()
      ]);
      
      setPrompts(promptsData);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar dados");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para lidar com a submissão do formulário
  const onSubmit = async (data: PromptFormData) => {
    try {
      const promptData = {
        ...data,
        evaluation_criteria: defaultEvaluationCriteria,
        created_by_user_id: user?.id || "",
      };

      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, promptData);
        toast.success("Prompt atualizado com sucesso!");
      } else {
        await createPrompt(promptData);
        toast.success("Prompt criado com sucesso!");
      }

      setIsModalOpen(false);
      setEditingPrompt(null);
      form.reset();
      await loadData();
    } catch (error) {
      console.error("Erro ao salvar prompt:", error);
      toast.error("Erro ao salvar prompt");
    }
  };

  // Função para abrir modal de edição
  const handleEdit = (prompt: EssayPrompt) => {
    setEditingPrompt(prompt);
    form.reset({
      title: prompt.title,
      description: prompt.description,
      suggested_repertoire: prompt.suggested_repertoire || "",
      subject_id: prompt.subject_id || "",
      start_date: prompt.start_date ? prompt.start_date.split('T')[0] : "",
      end_date: prompt.end_date ? prompt.end_date.split('T')[0] : "",
      is_active: prompt.is_active,
    });
    setIsModalOpen(true);
  };

  // Função para alternar status ativo
  const handleToggleActive = async (promptId: string, isActive: boolean) => {
    try {
      await togglePromptActiveStatus(promptId, isActive);
      toast.success(`Prompt ${isActive ? 'ativado' : 'desativado'} com sucesso!`);
      await loadData();
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      toast.error("Erro ao alterar status do prompt");
    }
  };

  // Função para excluir prompt
  const handleDelete = async (promptId: string) => {
    try {
      await deletePrompt(promptId);
      toast.success("Prompt excluído com sucesso!");
      await loadData();
    } catch (error) {
      console.error("Erro ao excluir prompt:", error);
      toast.error("Erro ao excluir prompt");
    }
  };

  // Função para abrir modal de criação
  const handleCreateNew = () => {
    setEditingPrompt(null);
    form.reset({
      title: "",
      description: "",
      suggested_repertoire: "",
      subject_id: "",
      start_date: "",
      end_date: "",
      is_active: true,
    });
    setIsModalOpen(true);
  };

  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
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
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Cabeçalho da Página */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Gerenciar Prompts de Redação
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crie e administre os temas de redação disponíveis para seus alunos.
          </p>
        </div>
        
        <Button 
          onClick={handleCreateNew}
          className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <Plus className="mr-2 h-4 w-4" />
          Novo Prompt
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total de Prompts
            </CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {prompts.length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Prompts Ativos
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {prompts.filter(p => p.is_active).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Em Período Ativo
            </CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {prompts.filter(isPromptActiveInPeriod).length}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Prompts Inativos
            </CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {prompts.filter(p => !p.is_active).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Prompts */}
      <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="text-xl text-gray-900 dark:text-white">
            Prompts de Redação
          </CardTitle>
        </CardHeader>
        <CardContent>
          {prompts.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Nenhum prompt encontrado
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Comece criando seu primeiro prompt de redação.
              </p>
              <Button onClick={handleCreateNew} className="bg-orange-500 hover:bg-orange-600 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Prompt
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-900 dark:text-white">Título</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Matéria</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Período</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Status</TableHead>
                    <TableHead className="text-gray-900 dark:text-white">Criado em</TableHead>
                    <TableHead className="text-gray-900 dark:text-white text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts.map((prompt) => (
                    <TableRow key={prompt.id} className="border-gray-200 dark:border-gray-700">
                      <TableCell className="font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-orange-500" />
                          {prompt.title}
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {prompt.subjects?.name || 'Não especificada'}
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        <div className="text-sm">
                          <div>Início: {formatDate(prompt.start_date)}</div>
                          <div>Fim: {formatDate(prompt.end_date)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={prompt.is_active}
                            onCheckedChange={(checked) => handleToggleActive(prompt.id, checked)}
                            className="data-[state=checked]:bg-orange-500"
                          />
                          <Badge 
                            variant={isPromptActiveInPeriod(prompt) ? "default" : "secondary"}
                            className={isPromptActiveInPeriod(prompt) ? "bg-green-500 hover:bg-green-600" : ""}
                          >
                            {isPromptActiveInPeriod(prompt) ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600 dark:text-gray-400">
                        {formatDate(prompt.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(prompt)}
                            className="hover:bg-orange-100 dark:hover:bg-orange-900/20 text-orange-600 dark:text-orange-400"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-gray-900 dark:text-white">
                                  Tem certeza?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o prompt 
                                  <strong> "{prompt.title}"</strong> e todas as redações associadas.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(prompt.id)}
                                  className="bg-red-500 hover:bg-red-600 text-white"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação/Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-gray-900 dark:text-white">
              {editingPrompt ? "Editar Prompt" : "Criar Novo Prompt"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {editingPrompt 
                ? "Edite os detalhes do prompt de redação." 
                : "Preencha os detalhes para criar um novo prompt de redação."
              }
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Título */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Título *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ex: Os desafios da educação a distância" 
                        {...field}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Enunciado */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Enunciado *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o tema da redação, o que o aluno deve abordar, contexto histórico, etc."
                        rows={6}
                        {...field}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Repertório Sugerido */}
              <FormField
                control={form.control}
                name="suggested_repertoire"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Repertório Sugerido</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Sugestões de repertório sociocultural que o aluno pode usar (livros, filmes, música, arte, etc.)"
                        rows={4}
                        {...field}
                        className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Matéria */}
              <FormField
                control={form.control}
                name="subject_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-900 dark:text-white">Matéria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white">
                          <SelectValue placeholder="Selecione uma matéria (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">Nenhuma matéria específica</SelectItem>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Período de Atividade */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white">Data de Início</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="end_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-900 dark:text-white">Data de Fim</FormLabel>
                      <FormControl>
                        <Input 
                          type="date"
                          {...field}
                          className="bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status Ativo */}
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-gray-300 dark:border-gray-600 p-4 bg-white dark:bg-gray-700">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base text-gray-900 dark:text-white">
                        Status Ativo
                      </FormLabel>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        O prompt estará disponível para os alunos
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="data-[state=checked]:bg-orange-500"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  {editingPrompt ? "Atualizar Prompt" : "Criar Prompt"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
