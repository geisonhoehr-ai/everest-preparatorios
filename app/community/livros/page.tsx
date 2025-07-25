"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gradients } from "@/lib/gradients";
import { 
  Library, 
  Download, 
  BookOpen, 
  Search,
  Filter,
  ExternalLink,
  Star,
  Clock,
  Users,
  Eye,
  FileText
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LivrosPage() {
  const livros = [
    {
      id: "1",
      title: "Português para Concursos - Gramática Completa",
      author: "Prof. Carlos Mendes",
      category: "Português",
      pages: 520,
      rating: 4.8,
      downloads: 12450,
      description: "Guia completo de gramática com exercícios práticos e teoria atualizada.",
      featured: true
    },
    {
      id: "2", 
      title: "Matemática Básica - Fundamentos",
      author: "Prof. Ana Silva",
      category: "Matemática",
      pages: 380,
      rating: 4.6,
      downloads: 8920,
      description: "Revisão completa dos conceitos fundamentais de matemática.",
      featured: false
    },
    {
      id: "3",
      title: "Física - Teoria e Exercícios",
      author: "Prof. João Santos",
      category: "Física",
      pages: 450,
      rating: 4.7,
      downloads: 6780,
      description: "Física aplicada com foco em questões de concursos militares.",
      featured: true
    }
  ];

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Português": return "bg-blue-500/20 text-blue-600 border-blue-500/50";
      case "Matemática": return "bg-green-500/20 text-green-600 border-green-500/50";
      case "Física": return "bg-purple-500/20 text-purple-600 border-purple-500/50";
      case "Inglês": return "bg-red-500/20 text-red-600 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/50";
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

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Biblioteca Digital</h1>
            <p className="text-muted-foreground mt-1">
              Acesse livros, apostilas e materiais de estudo selecionados pelos professores
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Library className="h-3 w-3" />
              {livros.length} livros disponíveis
            </Badge>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar livros por título, autor ou matéria..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="portugues">Português</SelectItem>
                <SelectItem value="matematica">Matemática</SelectItem>
                <SelectItem value="fisica">Física</SelectItem>
                <SelectItem value="ingles">Inglês</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Mais Popular</SelectItem>
                <SelectItem value="recent">Mais Recente</SelectItem>
                <SelectItem value="rating">Melhor Avaliado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${gradients.cardOrange} border-orange-500/20`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total de Livros</p>
                  <p className={`text-2xl font-bold ${gradients.textOrange}`}>47</p>
                </div>
                <Library className={`h-8 w-8 ${gradients.textOrange}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Downloads Total</p>
                  <p className="text-2xl font-bold">156k</p>
                </div>
                <Download className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avaliação Média</p>
                  <p className="text-2xl font-bold">4.7⭐</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Novos esta semana</p>
                  <p className="text-2xl font-bold">3</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Livros em Destaque */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold">📚 Livros em Destaque</h2>
            <Badge className={gradients.buttonOrange}>Recomendados</Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {livros.filter(livro => livro.featured).map((livro) => (
              <Card key={livro.id} className="hover:shadow-lg transition-all hover:scale-[1.02] relative">
                {livro.featured && (
                  <div className="absolute top-3 right-3 z-10">
                    <Badge className={gradients.buttonOrange}>Destaque</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-3 rounded-lg bg-orange-500/10">
                        <BookOpen className="h-8 w-8 text-orange-500" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg leading-tight">{livro.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">por {livro.author}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getCategoryColor(livro.category)}>{livro.category}</Badge>
                      <span className="text-sm text-muted-foreground">• {livro.pages} páginas</span>
                    </div>

                    <p className="text-sm text-muted-foreground">{livro.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          {renderStars(livro.rating)}
                        </div>
                        <span className="text-sm font-medium">{livro.rating}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Download className="h-4 w-4" />
                        {livro.downloads.toLocaleString()}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button className={`flex-1 ${gradients.buttonOrange}`} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
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
        </div>

        {/* Todos os Livros */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">📖 Todos os Livros</h2>
          
          <div className="space-y-4">
            {livros.map((livro) => (
              <Card key={livro.id} className="hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 rounded-lg bg-blue-500/10">
                        <BookOpen className="h-6 w-6 text-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{livro.title}</h3>
                          <Badge className={getCategoryColor(livro.category)}>{livro.category}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-2">
                          <Users className="h-4 w-4 inline mr-1" />
                          {livro.author} • {livro.pages} páginas
                        </p>

                        <p className="text-sm text-muted-foreground mb-3">{livro.description}</p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            {renderStars(livro.rating)}
                            <span className="ml-1 font-medium">{livro.rating}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Download className="h-4 w-4 text-muted-foreground" />
                            <span>{livro.downloads.toLocaleString()} downloads</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <Button className={gradients.buttonOrange} size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visualizar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Drive Embed como backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Biblioteca Completa - Google Drive
            </CardTitle>
            <CardDescription>
              Acesse nossa biblioteca completa com todos os livros e materiais organizados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full flex justify-center">
              <iframe
                src="https://drive.google.com/embeddedfolderview?id=1Xeq7J2FW0umqbph0ZtGVuO5pZGJLOEtD#grid"
                width="100%"
                height="600"
                style={{ border: "none", minHeight: 400, maxHeight: 600, width: '100%' }}
                allow="autoplay"
                title="Livros e Provas Google Drive"
                className="rounded-lg border"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
} 