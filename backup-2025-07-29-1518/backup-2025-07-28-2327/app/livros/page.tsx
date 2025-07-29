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
  
  // Estados para upload e criação
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [novoArquivo, setNovoArquivo] = useState({
    nome: "",
    descricao: "",
    tipo: "livro" as const,
    categoria: "",
    subcategoria: "",
    autor: "",
    ano: new Date().getFullYear(),
    nivel_dificuldade: "intermediario" as const,
    tags: [] as string[]
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkUserRole();
    loadCategorias();
    loadArquivos();
  }, []);

  const checkUserRole = async () => {
    try {
      const role = await getUserRoleClient();
      setUserRole(role);
    } catch (error) {
      console.error("Erro ao verificar role:", error);
    }
  };

  const loadCategorias = async () => {
    try {
      // Simular carregamento de categorias
      const categoriasMock: CategoriaAcervo[] = [
        {
          id: "1",
          nome: "Regulamentos Militares",
          descricao: "Livros e materiais sobre regulamentos militares",
          icone: "Shield",
          cor: "blue",
          total_arquivos: 15
        },
        {
          id: "2",
          nome: "Português",
          descricao: "Gramática, literatura e redação",
          icone: "BookOpen",
          cor: "purple",
          total_arquivos: 23
        },
        {
          id: "3",
          nome: "Matemática",
          descricao: "Álgebra, geometria e cálculo",
          icone: "Calculator",
          cor: "orange",
          total_arquivos: 18
        },
        {
          id: "4",
          nome: "História",
          descricao: "História geral e do Brasil",
          icone: "Landmark",
          cor: "green",
          total_arquivos: 12
        },
        {
          id: "5",
          nome: "Geografia",
          descricao: "Geografia física e humana",
          icone: "Globe",
          cor: "teal",
          total_arquivos: 9
        },
        {
          id: "6",
          nome: "Provas Anteriores",
          descricao: "Provas de concursos anteriores",
          icone: "FileText",
          cor: "red",
          total_arquivos: 31
        }
      ];
      
      setCategorias(categoriasMock);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };

  const loadArquivos = async () => {
    try {
      setLoading(true);
      
      // Simular carregamento de arquivos
      const arquivosMock: ArquivoAcervo[] = [
        {
          id: "1",
          nome: "Regulamento Disciplinar do Exército",
          descricao: "Regulamento completo com comentários e explicações",
          tipo: "livro",
          categoria: "Regulamentos Militares",
          arquivo_url: "/arquivos/regulamento-disciplinar.pdf",
          thumbnail_url: "/thumbnails/regulamento.jpg",
          tamanho_arquivo: 2048576, // 2MB
          formato_arquivo: "pdf",
          autor: "Exército Brasileiro",
          ano: 2023,
          rating: 4.8,
          downloads: 156,
          tags: ["regulamento", "disciplinar", "exército"],
          criado_por: "Professor Tiago",
          criado_em: "2024-01-15",
          atualizado_em: "2024-01-15",
          status: "ativo",
          featured: true,
          nivel_dificuldade: "intermediario",
          paginas: 245
        },
        {
          id: "2",
          nome: "Gramática Completa - Cegalla",
          descricao: "Gramática da língua portuguesa com exercícios",
          tipo: "livro",
          categoria: "Português",
          arquivo_url: "/arquivos/gramatica-cegalla.pdf",
          thumbnail_url: "/thumbnails/gramatica.jpg",
          tamanho_arquivo: 3145728, // 3MB
          formato_arquivo: "pdf",
          autor: "Domingos Paschoal Cegalla",
          ano: 2022,
          rating: 4.9,
          downloads: 203,
          tags: ["gramática", "português", "cegalla"],
          criado_por: "Professor Tiago",
          criado_em: "2024-01-10",
          atualizado_em: "2024-01-10",
          status: "ativo",
          featured: true,
          nivel_dificuldade: "avancado",
          paginas: 567
        },
        {
          id: "3",
          nome: "Prova ESA 2023 - Comentada",
          descricao: "Prova da ESA 2023 com gabarito comentado",
          tipo: "prova",
          categoria: "Provas Anteriores",
          arquivo_url: "/arquivos/esa-2023-comentada.pdf",
          thumbnail_url: "/thumbnails/esa-2023.jpg",
          tamanho_arquivo: 1048576, // 1MB
          formato_arquivo: "pdf",
          autor: "Professor Tiago",
          ano: 2023,
          rating: 4.7,
          downloads: 89,
          tags: ["esa", "2023", "comentada"],
          criado_por: "Professor Tiago",
          criado_em: "2024-01-05",
          atualizado_em: "2024-01-05",
          status: "ativo",
          featured: false,
          nivel_dificuldade: "intermediario"
        }
      ];
      
      setArquivos(arquivosMock);
    } catch (error) {
      console.error("Erro ao carregar arquivos:", error);
      toast.error("Erro ao carregar arquivos");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Validar tipo de arquivo
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'video/mp4'];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Tipo de arquivo não suportado. Use PDF, DOC, DOCX ou MP4.");
        return;
      }
      
      // Validar tamanho (máximo 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Arquivo muito grande. Máximo 10MB.");
        return;
      }
      
      toast.success("Arquivo selecionado com sucesso!");
    }
  };

  const handleSalvarArquivo = async () => {
    try {
      if (!selectedFile || !novoArquivo.nome || !novoArquivo.categoria) {
        toast.error("Preencha todos os campos obrigatórios e selecione um arquivo");
        return;
      }
      
      // Simular upload
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      
      setTimeout(() => {
        toast.success("Arquivo enviado com sucesso!");
        setShowUploadDialog(false);
        setSelectedFile(null);
        setNovoArquivo({
          nome: "",
          descricao: "",
          tipo: "livro",
          categoria: "",
          subcategoria: "",
          autor: "",
          ano: new Date().getFullYear(),
          nivel_dificuldade: "intermediario",
          tags: []
        });
        setUploadProgress(0);
        loadArquivos();
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao salvar arquivo:", error);
      toast.error("Erro ao salvar arquivo");
    }
  };

  const getFileIcon = (formato: string, tipo: string) => {
    if (tipo === "video") return FileVideo;
    if (formato === "pdf") return FileText;
    if (formato.includes("doc")) return FileText;
    if (formato.includes("xls")) return FileSpreadsheet;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTipoColor = (tipo: string) => {
    const cores: {[key: string]: string} = {
      "livro": "bg-blue-100 text-blue-800",
      "prova": "bg-green-100 text-green-800",
      "apostila": "bg-purple-100 text-purple-800",
      "video": "bg-red-100 text-red-800",
      "documento": "bg-gray-100 text-gray-800"
    };
    return cores[tipo] || "bg-gray-100 text-gray-800";
  };

  const getDificuldadeColor = (nivel?: string) => {
    const cores: {[key: string]: string} = {
      "basico": "bg-green-100 text-green-800",
      "intermediario": "bg-yellow-100 text-yellow-800",
      "avancado": "bg-red-100 text-red-800"
    };
    return cores[nivel || ""] || "bg-gray-100 text-gray-800";
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={cn(
          "h-4 w-4",
          i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        )}
      />
    ));
  };

  const arquivosFiltrados = arquivos.filter(arquivo => {
    const matchSearch = arquivo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       arquivo.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       arquivo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchTipo = filtroTipo === "todos" || arquivo.tipo === filtroTipo;
    const matchCategoria = filtroCategoria === "todas" || arquivo.categoria === filtroCategoria;
    
    return matchSearch && matchTipo && matchCategoria;
  });

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Acervo Digital</h1>
          <p className="text-muted-foreground">
            Biblioteca digital com livros, provas e materiais de estudo
          </p>
        </div>
        {userRole === "teacher" && (
          <Button onClick={() => setShowUploadDialog(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Enviar Arquivo
          </Button>
        )}
      </div>

      <div className="space-y-6">
        {/* Filtros e Busca */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar arquivos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="livro">Livros</SelectItem>
                  <SelectItem value="prova">Provas</SelectItem>
                  <SelectItem value="apostila">Apostilas</SelectItem>
                  <SelectItem value="video">Vídeos</SelectItem>
                  <SelectItem value="documento">Documentos</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filtroCategoria} onValueChange={setFiltroCategoria}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {categorias.map((categoria) => (
                    <SelectItem key={categoria.id} value={categoria.nome}>
                      {categoria.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === "grid" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Categorias */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categorias.map((categoria) => (
            <Card key={categoria.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${categoria.cor}-100`}>
                      <BookOpen className={`h-5 w-5 text-${categoria.cor}-600`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{categoria.nome}</CardTitle>
                      <CardDescription>{categoria.descricao}</CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">{categoria.total_arquivos}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Lista de Arquivos */}
        <div className={cn(
          "grid gap-4",
          viewMode === "grid" ? "md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {arquivosFiltrados.map((arquivo) => {
            const FileIcon = getFileIcon(arquivo.formato_arquivo, arquivo.tipo);
            
            return (
              <Card key={arquivo.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <FileIcon className="h-5 w-5" />
                      </div>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{arquivo.nome}</CardTitle>
                        <CardDescription className="line-clamp-2">{arquivo.descricao}</CardDescription>
                      </div>
                    </div>
                    {arquivo.featured && (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Destaque
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge className={getTipoColor(arquivo.tipo)}>
                      {arquivo.tipo}
                    </Badge>
                    <Badge variant="outline">
                      {arquivo.categoria}
                    </Badge>
                    {arquivo.nivel_dificuldade && (
                      <Badge className={getDificuldadeColor(arquivo.nivel_dificuldade)}>
                        {arquivo.nivel_dificuldade}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileIcon className="h-4 w-4" />
                        {arquivo.formato_arquivo.toUpperCase()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Archive className="h-4 w-4" />
                        {formatFileSize(arquivo.tamanho_arquivo)}
                      </div>
                    </div>
                    
                    {arquivo.autor && (
                      <div className="text-sm text-muted-foreground">
                        <span className="font-medium">Autor:</span> {arquivo.autor}
                        {arquivo.ano && ` (${arquivo.ano})`}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {renderStars(arquivo.rating)}
                        <span className="text-sm text-muted-foreground ml-1">
                          {arquivo.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Download className="h-4 w-4" />
                        {arquivo.downloads}
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button className="flex-1" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {arquivosFiltrados.length === 0 && !loading && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Nenhum arquivo encontrado</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tente ajustar os filtros ou fazer uma busca diferente.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog para upload de arquivo */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Novo Arquivo</DialogTitle>
            <DialogDescription>
              Adicione um novo arquivo ao acervo digital
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Arquivo</Label>
                <Input
                  id="nome"
                  value={novoArquivo.nome}
                  onChange={(e) => setNovoArquivo({...novoArquivo, nome: e.target.value})}
                  placeholder="Ex: Regulamento Disciplinar"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={novoArquivo.tipo} onValueChange={(value: any) => setNovoArquivo({...novoArquivo, tipo: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="livro">Livro</SelectItem>
                    <SelectItem value="prova">Prova</SelectItem>
                    <SelectItem value="apostila">Apostila</SelectItem>
                    <SelectItem value="video">Vídeo</SelectItem>
                    <SelectItem value="documento">Documento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                value={novoArquivo.descricao}
                onChange={(e) => setNovoArquivo({...novoArquivo, descricao: e.target.value})}
                placeholder="Descreva o conteúdo do arquivo..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={novoArquivo.categoria} onValueChange={(value) => setNovoArquivo({...novoArquivo, categoria: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria.id} value={categoria.nome}>
                        {categoria.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dificuldade">Nível de Dificuldade</Label>
                <Select value={novoArquivo.nivel_dificuldade} onValueChange={(value: any) => setNovoArquivo({...novoArquivo, nivel_dificuldade: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basico">Básico</SelectItem>
                    <SelectItem value="intermediario">Intermediário</SelectItem>
                    <SelectItem value="avancado">Avançado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="autor">Autor</Label>
                <Input
                  id="autor"
                  value={novoArquivo.autor}
                  onChange={(e) => setNovoArquivo({...novoArquivo, autor: e.target.value})}
                  placeholder="Nome do autor"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ano">Ano</Label>
                <Input
                  id="ano"
                  type="number"
                  value={novoArquivo.ano}
                  onChange={(e) => setNovoArquivo({...novoArquivo, ano: parseInt(e.target.value)})}
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Selecionar Arquivo</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.mp4"
                  className="hidden"
                />
                <div className="space-y-2">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <div>
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Escolher Arquivo
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    PDF, DOC, DOCX ou MP4 (máx. 10MB)
                  </p>
                </div>
                {selectedFile && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <File className="h-4 w-4" />
                        <span className="text-sm font-medium">{selectedFile.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {formatFileSize(selectedFile.size)}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enviando arquivo...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <Progress value={uploadProgress} className="w-full" />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSalvarArquivo} disabled={!selectedFile}>
                <Save className="mr-2 h-4 w-4" />
                Enviar Arquivo
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
} 