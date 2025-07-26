"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Download, 
  Clock, 
  Calendar,
  Search,
  Filter,
  ExternalLink,
  BookOpen,
  GraduationCap,
  Trophy,
  Target,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Play,
  Pause,
  CheckCircle2,
  AlertCircle,
  Users,
  Star,
  Bold,
  Italic,
  Underline,
  Type,
  Image as ImageIcon,
  Upload,
  X,
  Save,
  Send,
  Timer,
  Award,
  BarChart3,
  TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserRoleClient } from "@/lib/get-user-role";
import { createClient } from "@/lib/supabase/client";

// Tipos para provas online
interface ProvaOnline {
  id: string;
  titulo: string;
  descricao: string;
  materia: string;
  dificuldade: "facil" | "medio" | "dificil";
  tempo_limite: number; // em minutos
  questoes: Questao[];
  criado_por: string;
  criado_em: string;
  status: "rascunho" | "publicada" | "arquivada";
  tentativas_permitidas: number;
  nota_minima: number;
  tags: string[];
}

interface Questao {
  id: string;
  tipo: "multipla_escolha" | "dissertativa" | "verdadeiro_falso" | "completar";
  enunciado: string; // HTML formatado
  imagens?: string[];
  opcoes?: OpcaoQuestao[];
  resposta_correta?: string;
  pontuacao: number;
  explicacao?: string;
  ordem: number;
}

interface OpcaoQuestao {
  id: string;
  texto: string;
  correta: boolean;
}

interface TentativaProva {
  id: string;
  prova_id: string;
  aluno_id: string;
  respostas: RespostaAluno[];
  nota_final: number;
  tempo_gasto: number;
  iniciada_em: string;
  finalizada_em?: string;
  status: "em_andamento" | "finalizada" | "expirada";
}

interface RespostaAluno {
  questao_id: string;
  resposta: string;
  correta: boolean;
  pontos_obtidos: number;
}

export default function ProvasPage() {
  const [provas, setProvas] = useState<ProvaOnline[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("disponiveis");
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroMateria, setFiltroMateria] = useState("todas");
  const [filtroDificuldade, setFiltroDificuldade] = useState("todas");
  
  // Estados para criação/edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProva, setEditingProva] = useState<ProvaOnline | null>(null);
  const [formData, setFormData] = useState<Partial<ProvaOnline>>({
    titulo: "",
    descricao: "",
    materia: "",
    dificuldade: "medio",
    tempo_limite: 60,
    tentativas_permitidas: 3,
    nota_minima: 60,
    tags: [],
    questoes: []
  });
  
  // Estados para realização de prova
  const [provaAtiva, setProvaAtiva] = useState<ProvaOnline | null>(null);
  const [respostasAluno, setRespostasAluno] = useState<{[key: string]: string}>({});
  const [tempoRestante, setTempoRestante] = useState(0);
  const [questaoAtual, setQuestaoAtual] = useState(0);
  
  // Ref para editor de texto rico
  const editorRef = useRef<HTMLDivElement>(null);

  // Verificar role do usuário
  const checkUserRole = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const role = await getUserRoleClient(user.id);
        setUserRole(role);
      }
    } catch (error) {
      console.error("Erro ao verificar role do usuário:", error);
    }
  };

  useEffect(() => {
    checkUserRole();
    loadProvas();
  }, []);

  // Carregar provas
  const loadProvas = async () => {
    setLoading(true);
    try {
      // Simular carregamento de provas
      const provasSimuladas: ProvaOnline[] = [
        {
          id: "1",
          titulo: "Análise Sintática - Prova Básica",
          descricao: "Avalie seus conhecimentos em análise sintática com questões práticas",
          materia: "Português",
          dificuldade: "medio",
          tempo_limite: 45,
          questoes: [],
          criado_por: "prof1",
          criado_em: new Date().toISOString(),
          status: "publicada",
          tentativas_permitidas: 3,
          nota_minima: 70,
          tags: ["sintaxe", "gramática", "análise"]
        },
        {
          id: "2", 
          titulo: "Interpretação de Textos Avançada",
          descricao: "Teste suas habilidades de interpretação com textos complexos",
          materia: "Português",
          dificuldade: "dificil",
          tempo_limite: 90,
          questoes: [],
          criado_por: "prof1",
          criado_em: new Date().toISOString(),
          status: "publicada",
          tentativas_permitidas: 2,
          nota_minima: 75,
          tags: ["interpretação", "texto", "leitura"]
        }
      ];
      setProvas(provasSimuladas);
    } catch (error) {
      console.error("Erro ao carregar provas:", error);
      toast.error("Erro ao carregar provas");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar provas
  const provasFiltradas = provas.filter(prova => {
    const matchSearch = prova.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       prova.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchMateria = filtroMateria === "todas" || prova.materia === filtroMateria;
    const matchDificuldade = filtroDificuldade === "todas" || prova.dificuldade === filtroDificuldade;
    
    return matchSearch && matchMateria && matchDificuldade;
  });

  // Funções do editor rico
  const applyFormatting = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const insertImage = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = `<img src="${event.target?.result}" alt="Imagem da questão" style="max-width: 100%; height: auto;" />`;
          document.execCommand('insertHTML', false, img);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  // Salvar prova
  const handleSalvarProva = async () => {
    if (!formData.titulo || !formData.materia) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Prova salva com sucesso!");
      setIsModalOpen(false);
      setEditingProva(null);
      setFormData({
        titulo: "",
        descricao: "",
        materia: "",
        dificuldade: "medio",
        tempo_limite: 60,
        tentativas_permitidas: 3,
        nota_minima: 60,
        tags: [],
        questoes: []
      });
      loadProvas();
    } catch (error) {
      console.error("Erro ao salvar prova:", error);
      toast.error("Erro ao salvar prova");
    }
  };

  // Iniciar prova
  const iniciarProva = (prova: ProvaOnline) => {
    setProvaAtiva(prova);
    setRespostasAluno({});
    setQuestaoAtual(0);
    setTempoRestante(prova.tempo_limite * 60); // converter para segundos
  };

  // Finalizar prova
  const finalizarProva = () => {
    if (!provaAtiva) return;
    
    // Calcular resultado
    // Aqui você implementaria a lógica de correção
    toast.success("Prova finalizada! Resultado será exibido em breve.");
    setProvaAtiva(null);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "dificil": return "bg-red-500/20 text-red-600 border-red-500/30";
      case "medio": return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "facil": return "bg-green-500/20 text-green-600 border-green-500/30";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const getMateriaColor = (materia: string) => {
    switch (materia) {
      case "Português": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "Matemática": return "bg-green-500/20 text-green-600 border-green-500/30";
      case "Física": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      case "Inglês": return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const isTeacher = userRole === "teacher" || userRole === "admin";

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando provas...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  // Se há prova ativa, mostrar interface da prova
  if (provaAtiva) {
    const questaoAtualObj = provaAtiva.questoes[questaoAtual];
    const totalQuestoes = provaAtiva.questoes.length;
    const progressoPercentual = ((questaoAtual + 1) / totalQuestoes) * 100;

    return (
      <DashboardShell>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header da Prova */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 border-blue-500/20">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">{provaAtiva.titulo}</CardTitle>
                  <CardDescription>{provaAtiva.descricao}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-lg font-mono">
                    <Timer className="h-5 w-5" />
                    {Math.floor(tempoRestante / 60)}:{(tempoRestante % 60).toString().padStart(2, '0')}
                  </div>
                  <p className="text-sm text-muted-foreground">Tempo restante</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Questão {questaoAtual + 1} de {totalQuestoes}</span>
                  <span>{progressoPercentual.toFixed(0)}% concluído</span>
                </div>
                <Progress value={progressoPercentual} className="h-2" />
              </div>
            </CardHeader>
          </Card>

          {/* Questão Atual */}
          {questaoAtualObj && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Badge variant="outline">Questão {questaoAtual + 1}</Badge>
                    <Badge variant="outline">{questaoAtualObj.pontuacao} pontos</Badge>
                  </div>

                  {/* Enunciado */}
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: questaoAtualObj.enunciado }}
                  />

                  {/* Imagens da questão */}
                  {questaoAtualObj.imagens && questaoAtualObj.imagens.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {questaoAtualObj.imagens.map((img, index) => (
                        <img 
                          key={index}
                          src={img} 
                          alt={`Imagem ${index + 1} da questão`}
                          className="rounded-lg border max-w-full h-auto"
                        />
                      ))}
                    </div>
                  )}

                  {/* Opções de resposta */}
                  {questaoAtualObj.tipo === "multipla_escolha" && questaoAtualObj.opcoes && (
                    <RadioGroup 
                      value={respostasAluno[questaoAtualObj.id] || ""} 
                      onValueChange={(value) => setRespostasAluno({
                        ...respostasAluno,
                        [questaoAtualObj.id]: value
                      })}
                      className="space-y-3"
                    >
                      {questaoAtualObj.opcoes.map((opcao) => (
                        <div key={opcao.id} className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted/50">
                          <RadioGroupItem value={opcao.id} id={opcao.id} />
                          <Label htmlFor={opcao.id} className="flex-1 cursor-pointer">
                            {opcao.texto}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  {/* Resposta dissertativa */}
                  {questaoAtualObj.tipo === "dissertativa" && (
                    <Textarea
                      placeholder="Digite sua resposta..."
                      value={respostasAluno[questaoAtualObj.id] || ""}
                      onChange={(e) => setRespostasAluno({
                        ...respostasAluno,
                        [questaoAtualObj.id]: e.target.value
                      })}
                      className="min-h-[200px]"
                    />
                  )}

                  {/* Verdadeiro ou Falso */}
                  {questaoAtualObj.tipo === "verdadeiro_falso" && (
                    <RadioGroup 
                      value={respostasAluno[questaoAtualObj.id] || ""} 
                      onValueChange={(value) => setRespostasAluno({
                        ...respostasAluno,
                        [questaoAtualObj.id]: value
                      })}
                      className="flex gap-6"
                    >
                      <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted/50">
                        <RadioGroupItem value="verdadeiro" id="verdadeiro" />
                        <Label htmlFor="verdadeiro" className="cursor-pointer font-medium text-green-600">
                          ✓ Verdadeiro
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted/50">
                        <RadioGroupItem value="falso" id="falso" />
                        <Label htmlFor="falso" className="cursor-pointer font-medium text-red-600">
                          ✗ Falso
                        </Label>
                      </div>
                    </RadioGroup>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navegação */}
          <Card className="border-0 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <Button 
                  variant="outline"
                  onClick={() => setQuestaoAtual(Math.max(0, questaoAtual - 1))}
                  disabled={questaoAtual === 0}
                >
                  ← Anterior
                </Button>

                <div className="flex gap-2">
                  {provaAtiva.questoes.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setQuestaoAtual(index)}
                      className={cn(
                        "w-8 h-8 rounded border text-sm font-medium",
                        index === questaoAtual 
                          ? "bg-blue-500 text-white border-blue-500" 
                          : respostasAluno[provaAtiva.questoes[index]?.id]
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-background border-muted-foreground hover:bg-muted"
                      )}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>

                {questaoAtual < totalQuestoes - 1 ? (
                  <Button 
                    onClick={() => setQuestaoAtual(questaoAtual + 1)}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  >
                    Próxima →
                  </Button>
                ) : (
                  <Button 
                    onClick={finalizarProva}
                    className="bg-gradient-to-r from-green-500 to-green-600 text-white"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Finalizar Prova
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎯 Provas Online
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher 
                ? "Crie e gerencie provas interativas para seus alunos" 
                : "Pratique com provas online e receba feedback instantâneo"
              }
            </p>
          </div>
          
          {isTeacher && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Prova
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingProva ? "Editar Prova" : "Criar Nova Prova"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure sua prova online com questões interativas e recursos visuais
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs defaultValue="configuracao" className="space-y-6">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="configuracao">Configuração</TabsTrigger>
                    <TabsTrigger value="questoes">Questões</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>

                  <TabsContent value="configuracao" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="titulo">Título da Prova *</Label>
                        <Input
                          id="titulo"
                          value={formData.titulo}
                          onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                          placeholder="Ex: Análise Sintática - Prova Básica"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="materia">Matéria *</Label>
                        <Select value={formData.materia} onValueChange={(value) => setFormData({...formData, materia: value})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a matéria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Português">📝 Português</SelectItem>
                            <SelectItem value="Matemática">🔢 Matemática</SelectItem>
                            <SelectItem value="Física">⚛️ Física</SelectItem>
                            <SelectItem value="Inglês">🇬🇧 Inglês</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        value={formData.descricao}
                        onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                        placeholder="Descreva o objetivo e conteúdo da prova..."
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dificuldade">Dificuldade</Label>
                        <Select value={formData.dificuldade} onValueChange={(value: any) => setFormData({...formData, dificuldade: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="facil">🟢 Fácil</SelectItem>
                            <SelectItem value="medio">🟡 Médio</SelectItem>
                            <SelectItem value="dificil">🔴 Difícil</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tempo_limite">Tempo Limite (min)</Label>
                        <Input
                          id="tempo_limite"
                          type="number"
                          value={formData.tempo_limite}
                          onChange={(e) => setFormData({...formData, tempo_limite: parseInt(e.target.value)})}
                          placeholder="60"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tentativas">Tentativas Permitidas</Label>
                        <Input
                          id="tentativas"
                          type="number"
                          value={formData.tentativas_permitidas}
                          onChange={(e) => setFormData({...formData, tentativas_permitidas: parseInt(e.target.value)})}
                          placeholder="3"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nota_minima">Nota Mínima para Aprovação (%)</Label>
                      <Input
                        id="nota_minima"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.nota_minima}
                        onChange={(e) => setFormData({...formData, nota_minima: parseInt(e.target.value)})}
                        placeholder="70"
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="questoes" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium">Questões da Prova</h3>
                      <Button size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Questão
                      </Button>
                    </div>

                    {/* Editor de Questão */}
                    <Card className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Label>Tipo de Questão:</Label>
                          <Select>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multipla_escolha">Múltipla Escolha</SelectItem>
                              <SelectItem value="dissertativa">Dissertativa</SelectItem>
                              <SelectItem value="verdadeiro_falso">Verdadeiro/Falso</SelectItem>
                              <SelectItem value="completar">Completar</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Toolbar do Editor Rico */}
                        <div className="border rounded-lg p-2 bg-muted/50">
                          <div className="flex gap-2 mb-2">
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => applyFormatting('bold')}
                            >
                              <Bold className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => applyFormatting('italic')}
                            >
                              <Italic className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={() => applyFormatting('underline')}
                            >
                              <Underline className="h-4 w-4" />
                            </Button>
                            <div className="h-4 border-l border-muted-foreground mx-2" />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="sm"
                              onClick={insertImage}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <div
                            ref={editorRef}
                            contentEditable
                            className="min-h-[120px] p-3 border rounded bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                            data-placeholder="Digite o enunciado da questão aqui... Use os botões acima para formatar o texto."
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Pontuação da Questão</Label>
                          <Input
                            type="number"
                            placeholder="10"
                            className="w-24"
                          />
                        </div>
                      </div>
                    </Card>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="text-center py-12 text-muted-foreground">
                      <Eye className="h-16 w-16 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Preview da Prova</h3>
                      <p>Aqui você verá como a prova aparecerá para os alunos</p>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSalvarProva}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Prova
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px] bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-800">
            <TabsTrigger 
              value="disponiveis"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              🎯 Disponíveis
            </TabsTrigger>
            <TabsTrigger 
              value="minhas_tentativas"
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
            >
              📊 Resultados
            </TabsTrigger>
            {isTeacher && (
              <>
                <TabsTrigger 
                  value="gerenciar"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  ⚙️ Gerenciar
                </TabsTrigger>
                <TabsTrigger 
                  value="relatorios"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white"
                >
                  📈 Relatórios
                </TabsTrigger>
              </>
            )}
          </TabsList>

          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar provas por título ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filtroMateria} onValueChange={setFiltroMateria}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Matéria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="Português">Português</SelectItem>
                  <SelectItem value="Matemática">Matemática</SelectItem>
                  <SelectItem value="Física">Física</SelectItem>
                  <SelectItem value="Inglês">Inglês</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroDificuldade} onValueChange={setFiltroDificuldade}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="facil">Fácil</SelectItem>
                  <SelectItem value="medio">Médio</SelectItem>
                  <SelectItem value="dificil">Difícil</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Provas Disponíveis</p>
                    <p className="text-2xl font-bold">{provas.length}</p>
                  </div>
                  <Trophy className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Provas Realizadas</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Média Geral</p>
                    <p className="text-2xl font-bold">78%</p>
                  </div>
                  <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tempo Médio</p>
                    <p className="text-2xl font-bold">45min</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Provas Disponíveis */}
          <TabsContent value="disponiveis" className="space-y-4">
            {provasFiltradas.length === 0 ? (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20">
                <CardContent className="text-center py-12">
                  <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma prova encontrada</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filtroMateria !== "todas" || filtroDificuldade !== "todas"
                      ? "Tente ajustar os filtros de busca."
                      : "Aguarde enquanto os professores preparam as provas."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {provasFiltradas.map((prova) => (
                  <Card key={prova.id} className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-200 hover:scale-[1.02]">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <h3 className="font-semibold text-lg line-clamp-2">{prova.titulo}</h3>
                          <div className="flex flex-col gap-1">
                            <Badge className={getMateriaColor(prova.materia)}>{prova.materia}</Badge>
                            <Badge className={getDifficultyColor(prova.dificuldade)}>
                              {prova.dificuldade}
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-3">{prova.descricao}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span>{prova.tempo_limite}min</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{prova.questoes.length} questões</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Trophy className="h-4 w-4 text-muted-foreground" />
                            <span>{prova.nota_minima}% mín.</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{prova.tentativas_permitidas}x</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          {prova.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            onClick={() => iniciarProva(prova)}
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Iniciar Prova
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Outras abas podem ser implementadas aqui */}
          <TabsContent value="minhas_tentativas" className="space-y-4">
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-16 w-16 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Seus Resultados</h3>
              <p>Histórico de tentativas e notas aparecerão aqui</p>
            </div>
          </TabsContent>

          {isTeacher && (
            <>
              <TabsContent value="gerenciar" className="space-y-4">
                <div className="text-center py-12 text-muted-foreground">
                  <Edit3 className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Gerenciar Provas</h3>
                  <p>Interface de gerenciamento para editar e organizar suas provas</p>
                </div>
              </TabsContent>

              <TabsContent value="relatorios" className="space-y-4">
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingUp className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Relatórios de Performance</h3>
                  <p>Estatísticas detalhadas sobre o desempenho dos alunos</p>
                </div>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </DashboardShell>
  );
} 