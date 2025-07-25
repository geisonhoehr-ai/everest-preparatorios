"use client";

import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { gradients } from "@/lib/gradients";
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
  Target
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProvasPage() {
  const provas = [
    {
      id: "1",
      title: "CIAAR 2023 - Prova Completa",
      year: "2023",
      type: "Oficial",
      subjects: ["Português", "Matemática", "Inglês", "Física"],
      duration: "4h 30min",
      difficulty: "Alta",
      downloads: 2847
    },
    {
      id: "2", 
      title: "CIAAR 2022 - Prova Completa",
      year: "2022",
      type: "Oficial", 
      subjects: ["Português", "Matemática", "Inglês", "Física"],
      duration: "4h 30min",
      difficulty: "Alta",
      downloads: 3156
    },
    {
      id: "3",
      title: "Simulado CIAAR - Modelo 2024",
      year: "2024",
      type: "Simulado",
      subjects: ["Português", "Matemática"],
      duration: "2h 15min", 
      difficulty: "Média",
      downloads: 1924
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Alta": return "bg-red-500/20 text-red-600 border-red-500/50";
      case "Média": return "bg-yellow-500/20 text-yellow-600 border-yellow-500/50";
      case "Baixa": return "bg-green-500/20 text-green-600 border-green-500/50";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/50";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Oficial": return "bg-orange-500/20 text-orange-600 border-orange-500/50";
      case "Simulado": return "bg-blue-500/20 text-blue-600 border-blue-500/50";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/50";
    }
  };

  return (
    <DashboardShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Provas CIAAR</h1>
            <p className="text-muted-foreground mt-1">
              Acesse provas anteriores e simulados para treinar e se preparar melhor
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              {provas.length} provas disponíveis
            </Badge>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar provas por ano ou tipo..."
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2023">2023</SelectItem>
                <SelectItem value="2022">2022</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="oficial">Oficial</SelectItem>
                <SelectItem value="simulado">Simulado</SelectItem>
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
                  <p className="text-sm text-muted-foreground">Provas Oficiais</p>
                  <p className={`text-2xl font-bold ${gradients.textOrange}`}>15</p>
                </div>
                <Trophy className={`h-8 w-8 ${gradients.textOrange}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Simulados</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
                <Target className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Downloads</p>
                  <p className="text-2xl font-bold">12.5k</p>
                </div>
                <Download className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Últimas 24h</p>
                  <p className="text-2xl font-bold">47</p>
                </div>
                <Clock className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Provas */}
        <div className="space-y-4">
          {provas.map((prova) => (
            <Card key={prova.id} className="hover:shadow-lg transition-all hover:scale-[1.01]">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <FileText className="h-5 w-5 text-orange-500" />
                      <h3 className="text-lg font-semibold">{prova.title}</h3>
                      <Badge className={getTypeColor(prova.type)}>{prova.type}</Badge>
                      <Badge className={getDifficultyColor(prova.difficulty)}>{prova.difficulty}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {prova.year}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {prova.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="h-4 w-4" />
                        {prova.downloads.toLocaleString()} downloads
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {prova.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
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

        {/* Drive Embed como fallback */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Arquivo Completo - Google Drive
            </CardTitle>
            <CardDescription>
              Acesse nossa pasta completa com todas as provas organizadas por ano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full flex justify-center">
              <iframe
                src="https://drive.google.com/embeddedfolderview?id=1hDTkYZBPtkVFQH4n9nkfO0bxnRRtRBty#grid"
                width="100%"
                height="600"
                style={{ border: "none", minHeight: 400, maxHeight: 600, width: '100%' }}
                allow="autoplay"
                title="Provas Google Drive"
                className="rounded-lg border"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
} 