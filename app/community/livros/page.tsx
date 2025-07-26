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
import { toast } from "sonner";
import { useState, useEffect, useRef } from "react";
import { 
  Archive,
  Download, 
  BookOpen, 
  Search,
  Filter,
  ExternalLink,
  Star,
  Clock,
  Users,
  Eye,
  FileText,
  Upload,
  Plus,
  Edit3,
  Trash2,
  File,
  ImageIcon,
  FileVideo,
  FileSpreadsheet,
  FolderOpen,
  Grid3x3,
  List,
  SortAsc,
  SortDesc,
  CheckCircle2,
  AlertCircle,
  X,
  Save,
  Folder,
  FileType,
  Calendar
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUserRoleClient } from "@/lib/get-user-role";
import { createClient } from "@/lib/supabase/client";

// Tipos para o sistema de acervo
interface ArquivoAcervo {
  id: string;
  nome: string;
  descricao: string;
  tipo: "livro" | "prova" | "apostila" | "video" | "documento";
  categoria: string;
  subcategoria?: string;
  arquivo_url: string;
  thumbnail_url?: string;
  tamanho_arquivo: number; // em bytes
  formato_arquivo: string; // pdf, doc, mp4, etc
  autor?: string;
  ano?: number;
  rating: number;
  downloads: number;
  tags: string[];
  criado_por: string;
  criado_em: string;
  atualizado_em: string;
  status: "ativo" | "arquivado" | "em_revisao";
  featured: boolean;
  nivel_dificuldade?: "basico" | "intermediario" | "avancado";
  paginas?: number;
  duracao?: number; // para vídeos, em minutos
}

interface CategoriaAcervo {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  cor: string;
  total_arquivos: number;
}

export default function AcervoPage() {
  const [arquivos, setArquivos] = useState<ArquivoAcervo[]>([]);
  const [categorias, setCategorias] = useState<CategoriaAcervo[]>([]);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Estados de filtros e busca
  const [searchTerm, setSearchTerm] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("todos");
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [ordenacao, setOrdenacao] = useState("mais_recentes");
  
  // Estados para modal de upload/edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArquivo, setEditingArquivo] = useState<ArquivoAcervo | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Formulário de arquivo
  const [formData, setFormData] = useState<Partial<ArquivoAcervo>>({
    nome: "",
    descricao: "",
    tipo: "livro",
    categoria: "",
    subcategoria: "",
    autor: "",
    ano: new Date().getFullYear(),
    tags: [],
    nivel_dificuldade: "intermediario",
    featured: false
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    loadCategorias();
    loadArquivos();
  }, []);

  // Carregar categorias
  const loadCategorias = async () => {
    try {
      const categoriasSimuladas: CategoriaAcervo[] = [
        {
          id: "1",
          nome: "Português",
          descricao: "Livros e materiais de língua portuguesa",
          icone: "📝",
          cor: "blue",
          total_arquivos: 47
        },
        {
          id: "2",
          nome: "Matemática",
          descricao: "Materiais de matemática e cálculo",
          icone: "🔢",
          cor: "green",
          total_arquivos: 32
        },
        {
          id: "3",
          nome: "Física",
          descricao: "Livros e exercícios de física",
          icone: "⚛️",
          cor: "purple",
          total_arquivos: 28
        },
        {
          id: "4",
          nome: "Provas Anteriores",
          descricao: "Provas de anos anteriores para download",
          icone: "📋",
          cor: "orange",
          total_arquivos: 156
        },
        {
          id: "5",
          nome: "Simulados",
          descricao: "Simulados e testes práticos",
          icone: "🎯",
          cor: "red",
          total_arquivos: 89
        },
        {
          id: "6",
          nome: "Videoaulas",
          descricao: "Aulas em vídeo e materiais audiovisuais",
          icone: "🎬",
          cor: "pink",
          total_arquivos: 234
        }
      ];
      setCategorias(categoriasSimuladas);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  // Carregar arquivos
  const loadArquivos = async () => {
    setLoading(true);
    try {
      const arquivosSimulados: ArquivoAcervo[] = [
        {
          id: "1",
          nome: "Português Completo para Concursos - CIAAR 2024",
          descricao: "Guia completo de gramática, interpretação de textos e redação para concursos militares",
          tipo: "livro",
          categoria: "Português",
          subcategoria: "Gramática",
          arquivo_url: "/downloads/portugues-completo-ciaar-2024.pdf",
          thumbnail_url: "/thumbnails/portugues-completo.jpg",
          tamanho_arquivo: 15728640, // 15MB
          formato_arquivo: "pdf",
          autor: "Prof. Carlos Mendes",
          ano: 2024,
          rating: 4.8,
          downloads: 12450,
          tags: ["gramática", "interpretação", "redação", "ciaar"],
          criado_por: "prof1",
          criado_em: "2024-01-15T10:00:00Z",
          atualizado_em: "2024-01-15T10:00:00Z",
          status: "ativo",
          featured: true,
          nivel_dificuldade: "intermediario",
          paginas: 520
        },
        {
          id: "2",
          nome: "CIAAR 2023 - Prova Completa com Gabarito",
          descricao: "Prova oficial do CIAAR 2023 com gabarito comentado e resolução detalhada",
          tipo: "prova",
          categoria: "Provas Anteriores",
          subcategoria: "CIAAR",
          arquivo_url: "/downloads/ciaar-2023-prova-completa.pdf",
          thumbnail_url: "/thumbnails/ciaar-2023.jpg",
          tamanho_arquivo: 8388608, // 8MB
          formato_arquivo: "pdf",
          autor: "Banca CIAAR",
          ano: 2023,
          rating: 4.9,
          downloads: 18750,
          tags: ["prova", "gabarito", "ciaar", "2023"],
          criado_por: "admin1",
          criado_em: "2023-12-01T10:00:00Z",
          atualizado_em: "2023-12-01T10:00:00Z",
          status: "ativo",
          featured: true,
          nivel_dificuldade: "avancado",
          paginas: 32
        },
        {
          id: "3",
          nome: "Matemática Básica - Fundamentos e Exercícios",
          descricao: "Revisão completa de matemática básica com exercícios práticos e teoria aplicada",
          tipo: "livro",
          categoria: "Matemática",
          subcategoria: "Básica",
          arquivo_url: "/downloads/matematica-basica-fundamentos.pdf",
          thumbnail_url: "/thumbnails/matematica-basica.jpg",
          tamanho_arquivo: 12582912, // 12MB
          formato_arquivo: "pdf",
          autor: "Prof. Ana Silva",
          ano: 2024,
          rating: 4.6,
          downloads: 8920,
          tags: ["matemática", "básica", "exercícios", "fundamentos"],
          criado_por: "prof2",
          criado_em: "2024-02-01T10:00:00Z",
          atualizado_em: "2024-02-01T10:00:00Z",
          status: "ativo",
          featured: false,
          nivel_dificuldade: "basico",
          paginas: 380
        },
        {
          id: "4",
          nome: "Aula: Análise Sintática Avançada",
          descricao: "Videoaula completa sobre análise sintática com exemplos práticos e exercícios resolvidos",
          tipo: "video",
          categoria: "Videoaulas",
          subcategoria: "Português",
          arquivo_url: "/videos/analise-sintatica-avancada.mp4",
          thumbnail_url: "/thumbnails/video-analise-sintatica.jpg",
          tamanho_arquivo: 524288000, // 500MB
          formato_arquivo: "mp4",
          autor: "Prof. Maria Santos",
          ano: 2024,
          rating: 4.7,
          downloads: 3420,
          tags: ["videoaula", "sintaxe", "análise", "português"],
          criado_por: "prof3",
          criado_em: "2024-03-10T10:00:00Z",
          atualizado_em: "2024-03-10T10:00:00Z",
          status: "ativo",
          featured: true,
          nivel_dificuldade: "avancado",
          duracao: 75
        }
      ];
      setArquivos(arquivosSimulados);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      toast.error("Erro ao carregar arquivos do acervo");
    } finally {
      setLoading(false);
    }
  };

  // Filtrar e ordenar arquivos
  const arquivosFiltrados = arquivos
    .filter(arquivo => {
      const matchSearch = arquivo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         arquivo.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         arquivo.autor?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipo = filtroTipo === "todos" || arquivo.tipo === filtroTipo;
      const matchCategoria = filtroCategoria === "todas" || arquivo.categoria === filtroCategoria;
      
      if (activeTab === "featured") {
        return matchSearch && matchTipo && matchCategoria && arquivo.featured;
      }
      
      if (activeTab !== "todos") {
        return matchSearch && matchTipo && matchCategoria && arquivo.tipo === activeTab;
      }
      
      return matchSearch && matchTipo && matchCategoria;
    })
    .sort((a, b) => {
      switch (ordenacao) {
        case "mais_recentes":
          return new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime();
        case "mais_antigos":
          return new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime();
        case "mais_baixados":
          return b.downloads - a.downloads;
        case "melhor_avaliados":
          return b.rating - a.rating;
        case "alfabetica":
          return a.nome.localeCompare(b.nome);
        default:
          return 0;
      }
    });

  // Upload de arquivo
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simular upload com progresso
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Simular upload
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aqui você implementaria o upload real para o Supabase Storage
      const arquivo_url = `/uploads/${file.name}`;
      
      setFormData(prev => ({
        ...prev,
        arquivo_url,
        formato_arquivo: file.type,
        tamanho_arquivo: file.size,
        nome: prev.nome || file.name.replace(/\.[^/.]+$/, "")
      }));

      toast.success("Arquivo enviado com sucesso!");
    } catch (error) {
      console.error("Erro no upload:", error);
      toast.error("Erro ao enviar arquivo");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // Salvar arquivo no acervo
  const handleSalvarArquivo = async () => {
    if (!formData.nome || !formData.categoria || !formData.arquivo_url) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Arquivo adicionado ao acervo com sucesso!");
      setIsModalOpen(false);
      setEditingArquivo(null);
      setFormData({
        nome: "",
        descricao: "",
        tipo: "livro",
        categoria: "",
        subcategoria: "",
        autor: "",
        ano: new Date().getFullYear(),
        tags: [],
        nivel_dificuldade: "intermediario",
        featured: false
      });
      loadArquivos();
    } catch (error) {
      console.error("Erro ao salvar arquivo:", error);
      toast.error("Erro ao salvar arquivo");
    }
  };

  const getFileIcon = (formato: string, tipo: string) => {
    if (tipo === "video") return <FileVideo className="h-8 w-8 text-red-500" />;
    if (formato === "pdf") return <FileText className="h-8 w-8 text-red-600" />;
    if (formato.includes("sheet") || formato.includes("excel")) return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    if (formato.includes("image")) return <ImageIcon className="h-8 w-8 text-blue-600" />;
    return <FileText className="h-8 w-8 text-gray-600" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "livro": return "bg-blue-500/20 text-blue-600 border-blue-500/30";
      case "prova": return "bg-orange-500/20 text-orange-600 border-orange-500/30";
      case "apostila": return "bg-green-500/20 text-green-600 border-green-500/30";
      case "video": return "bg-red-500/20 text-red-600 border-red-500/30";
      case "documento": return "bg-purple-500/20 text-purple-600 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const getDificuldadeColor = (nivel?: string) => {
    switch (nivel) {
      case "basico": return "bg-green-500/20 text-green-600 border-green-500/30";
      case "intermediario": return "bg-yellow-500/20 text-yellow-600 border-yellow-500/30";
      case "avancado": return "bg-red-500/20 text-red-600 border-red-500/30";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/30";
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < Math.floor(rating) 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  const isTeacher = userRole === "teacher" || userRole === "admin";

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando acervo...</p>
          </div>
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-orange-600 bg-clip-text text-transparent">
              📚 Acervo Digital
            </h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher 
                ? "Gerencie livros, provas e materiais para seus alunos" 
                : "Acesse nossa biblioteca completa de livros, provas e materiais de estudo"
              }
            </p>
          </div>
          
          {isTeacher && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-purple-500 to-orange-500 hover:from-purple-600 hover:to-orange-600 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Material
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingArquivo ? "Editar Material" : "Adicionar Novo Material"}
                  </DialogTitle>
                  <DialogDescription>
                    Adicione livros, provas, apostilas e materiais ao acervo digital
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Upload de Arquivo */}
                  <div className="space-y-4">
                    <Label>Arquivo *</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <input
                        ref={fileInputRef}
                        type="file"
                        onChange={handleFileUpload}
                        accept=".pdf,.doc,.docx,.mp4,.avi,.mov,.jpg,.jpeg,.png"
                        className="hidden"
                      />
                      
                      {isUploading ? (
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                          <p className="text-sm text-muted-foreground mb-2">Enviando arquivo...</p>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{uploadProgress}%</p>
                        </div>
                      ) : formData.arquivo_url ? (
                        <div className="text-center">
                          <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                          <p className="text-sm font-medium">Arquivo enviado com sucesso!</p>
                          <p className="text-xs text-muted-foreground">{formData.nome}</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Escolher outro arquivo
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center">
                          <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-4" />
                          <Button 
                            variant="outline" 
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Escolher Arquivo
                          </Button>
                          <p className="text-xs text-muted-foreground mt-2">
                            PDF, DOC, MP4, JPG (máx. 500MB)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações do Material */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Título do Material *</Label>
                      <Input
                        id="nome"
                        value={formData.nome}
                        onChange={(e) => setFormData({...formData, nome: e.target.value})}
                        placeholder="Ex: Português Completo para Concursos"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="autor">Autor</Label>
                      <Input
                        id="autor"
                        value={formData.autor}
                        onChange={(e) => setFormData({...formData, autor: e.target.value})}
                        placeholder="Ex: Prof. Carlos Mendes"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="descricao">Descrição</Label>
                    <Textarea
                      id="descricao"
                      value={formData.descricao}
                      onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                      placeholder="Descreva o conteúdo e objetivo do material..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tipo">Tipo de Material *</Label>
                      <Select value={formData.tipo} onValueChange={(value: any) => setFormData({...formData, tipo: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="livro">📖 Livro</SelectItem>
                          <SelectItem value="prova">📋 Prova</SelectItem>
                          <SelectItem value="apostila">📄 Apostila</SelectItem>
                          <SelectItem value="video">🎬 Vídeo</SelectItem>
                          <SelectItem value="documento">📁 Documento</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="categoria">Categoria *</Label>
                      <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Português">📝 Português</SelectItem>
                          <SelectItem value="Matemática">🔢 Matemática</SelectItem>
                          <SelectItem value="Física">⚛️ Física</SelectItem>
                          <SelectItem value="Inglês">🇬🇧 Inglês</SelectItem>
                          <SelectItem value="Provas Anteriores">📋 Provas Anteriores</SelectItem>
                          <SelectItem value="Simulados">🎯 Simulados</SelectItem>
                          <SelectItem value="Videoaulas">🎬 Videoaulas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nivel">Nível</Label>
                      <Select value={formData.nivel_dificuldade} onValueChange={(value: any) => setFormData({...formData, nivel_dificuldade: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="basico">🟢 Básico</SelectItem>
                          <SelectItem value="intermediario">🟡 Intermediário</SelectItem>
                          <SelectItem value="avancado">🔴 Avançado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="ano">Ano</Label>
                      <Input
                        id="ano"
                        type="number"
                        value={formData.ano}
                        onChange={(e) => setFormData({...formData, ano: parseInt(e.target.value)})}
                        placeholder="2024"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subcategoria">Subcategoria</Label>
                      <Input
                        id="subcategoria"
                        value={formData.subcategoria}
                        onChange={(e) => setFormData({...formData, subcategoria: e.target.value})}
                        placeholder="Ex: Gramática, Álgebra..."
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                      className="rounded"
                    />
                    <Label htmlFor="featured">Destacar este material</Label>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSalvarArquivo}
                    className="bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                    disabled={!formData.nome || !formData.categoria || !formData.arquivo_url}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Material
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Categorias Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categorias.map((categoria) => (
            <Card 
              key={categoria.id} 
              className={cn(
                "cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02] border-0 shadow-xl",
                categoria.cor === "blue" && "bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/20",
                categoria.cor === "green" && "bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/20",
                categoria.cor === "purple" && "bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-500/20",
                categoria.cor === "orange" && "bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-500/20",
                categoria.cor === "red" && "bg-gradient-to-br from-red-500/20 to-red-600/30 border-red-500/20",
                categoria.cor === "pink" && "bg-gradient-to-br from-pink-500/20 to-pink-600/30 border-pink-500/20"
              )}
              onClick={() => setFiltroCategoria(categoria.nome)}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{categoria.icone}</div>
                <h3 className="font-medium text-sm">{categoria.nome}</h3>
                <p className="text-xs text-muted-foreground mt-1">{categoria.total_arquivos} itens</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <TabsList className="grid w-full grid-cols-5 sm:w-auto bg-gradient-to-r from-purple-500/10 to-orange-500/10 border border-purple-200 dark:border-purple-800">
              <TabsTrigger value="todos">📂 Todos</TabsTrigger>
              <TabsTrigger value="featured">⭐ Destaques</TabsTrigger>
              <TabsTrigger value="livro">📖 Livros</TabsTrigger>
              <TabsTrigger value="prova">📋 Provas</TabsTrigger>
              <TabsTrigger value="video">🎬 Vídeos</TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3x3 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Filtros e Busca */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, autor ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="livro">Livros</SelectItem>
                  <SelectItem value="prova">Provas</SelectItem>
                  <SelectItem value="video">Vídeos</SelectItem>
                  <SelectItem value="apostila">Apostilas</SelectItem>
                </SelectContent>
              </Select>
              <Select value={ordenacao} onValueChange={setOrdenacao}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Ordenar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mais_recentes">Mais Recentes</SelectItem>
                  <SelectItem value="mais_baixados">Mais Baixados</SelectItem>
                  <SelectItem value="melhor_avaliados">Melhor Avaliados</SelectItem>
                  <SelectItem value="alfabetica">A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Estatísticas Rápidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-500/20 to-blue-600/30 border-blue-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Itens</p>
                    <p className="text-2xl font-bold">{arquivos.length}</p>
                  </div>
                  <Archive className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-green-500/20 to-green-600/30 border-green-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Downloads Total</p>
                    <p className="text-2xl font-bold">{arquivos.reduce((acc, arquivo) => acc + arquivo.downloads, 0).toLocaleString()}</p>
                  </div>
                  <Download className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-purple-500/20 to-purple-600/30 border-purple-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avaliação Média</p>
                    <p className="text-2xl font-bold">
                      {(arquivos.reduce((acc, arquivo) => acc + arquivo.rating, 0) / arquivos.length).toFixed(1)}⭐
                    </p>
                  </div>
                  <Star className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-500/20 to-orange-600/30 border-orange-500/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Novos esta semana</p>
                    <p className="text-2xl font-bold">7</p>
                  </div>
                  <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Arquivos */}
          <TabsContent value={activeTab} className="space-y-4">
            {arquivosFiltrados.length === 0 ? (
              <Card className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20">
                <CardContent className="text-center py-12">
                  <FolderOpen className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum material encontrado</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || filtroTipo !== "todos" || filtroCategoria !== "todas"
                      ? "Tente ajustar os filtros de busca."
                      : "Aguarde enquanto adicionamos novos materiais ao acervo."
                    }
                  </p>
                  {isTeacher && (
                    <Button onClick={() => setIsModalOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Adicionar Primeiro Material
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : viewMode === "grid" ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {arquivosFiltrados.map((arquivo) => (
                  <Card key={arquivo.id} className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all duration-200 hover:scale-[1.02] group">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            {getFileIcon(arquivo.formato_arquivo, arquivo.tipo)}
                            <div className="flex-1">
                              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                                {arquivo.nome}
                              </h3>
                              {arquivo.autor && (
                                <p className="text-sm text-muted-foreground">por {arquivo.autor}</p>
                              )}
                            </div>
                          </div>
                          {arquivo.featured && (
                            <Badge className="bg-gradient-to-r from-purple-500 to-orange-500 text-white">
                              Destaque
                            </Badge>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Badge className={getTipoColor(arquivo.tipo)}>{arquivo.tipo}</Badge>
                          <Badge variant="outline">{arquivo.categoria}</Badge>
                          {arquivo.nivel_dificuldade && (
                            <Badge className={getDificuldadeColor(arquivo.nivel_dificuldade)}>
                              {arquivo.nivel_dificuldade}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-muted-foreground line-clamp-3">{arquivo.descricao}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            <span>{arquivo.downloads.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <File className="h-4 w-4 text-muted-foreground" />
                            <span>{formatFileSize(arquivo.tamanho_arquivo)}</span>
                          </div>
                          {arquivo.paginas && (
                            <div className="flex items-center gap-1">
                              <BookOpen className="h-4 w-4 text-muted-foreground" />
                              <span>{arquivo.paginas} pág.</span>
                            </div>
                          )}
                          {arquivo.duracao && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{arquivo.duracao}min</span>
                            </div>
                          )}
                          {arquivo.ano && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span>{arquivo.ano}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {renderStars(arquivo.rating)}
                            </div>
                            <span className="text-sm font-medium">{arquivo.rating}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            className="flex-1 bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isTeacher && (
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {arquivosFiltrados.map((arquivo) => (
                  <Card key={arquivo.id} className="border-0 shadow-xl bg-gradient-to-br from-background to-muted/20 hover:shadow-2xl transition-all group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        {getFileIcon(arquivo.formato_arquivo, arquivo.tipo)}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">
                              {arquivo.nome}
                            </h3>
                            <div className="flex gap-1 flex-shrink-0">
                              <Badge className={getTipoColor(arquivo.tipo)}>{arquivo.tipo}</Badge>
                              {arquivo.featured && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-orange-500 text-white">
                                  Destaque
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{arquivo.descricao}</p>
                          
                          <div className="flex items-center gap-4 text-sm">
                            {arquivo.autor && (
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                <span>{arquivo.autor}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <Download className="h-4 w-4 text-muted-foreground" />
                              <span>{arquivo.downloads.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <File className="h-4 w-4 text-muted-foreground" />
                              <span>{formatFileSize(arquivo.tamanho_arquivo)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {renderStars(arquivo.rating)}
                              <span className="ml-1">{arquivo.rating}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          <Button 
                            className="bg-gradient-to-r from-purple-500 to-orange-500 text-white"
                            size="sm"
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {isTeacher && (
                            <Button variant="outline" size="sm">
                              <Edit3 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
} 