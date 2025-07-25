"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { gradients } from "@/lib/gradients";
import { getUserRoleClient } from "@/lib/get-user-role";
import { createClient } from "@/lib/supabase/client";
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Search,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  User,
  Calendar,
  Plus,
  MessageSquare,
  ArrowLeft,
  MoreHorizontal,
  Shield,
  Crown
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  isOpen?: boolean;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: "aberto" | "em_andamento" | "resolvido" | "fechado";
  priority: "baixa" | "media" | "alta" | "urgente";
  createdAt: Date;
  lastMessage: Date;
  unreadCount: number;
  studentId: string; // ID do aluno que criou o ticket
  studentName: string; // Nome do aluno
  studentEmail: string; // Email do aluno
  messages: Message[];
}

interface Message {
  id: string;
  content: string;
  sender: {
    name: string;
    role: "student" | "teacher" | "admin";
    avatar: string;
  };
  timestamp: Date;
  isRead: boolean;
}

export default function SuportePage() {
  const [activeView, setActiveView] = useState<"overview" | "chat">("overview");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [userRole, setUserRole] = useState<"student" | "teacher" | "admin" | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Dados mock expandidos com informações dos alunos
  const [allTickets] = useState<Ticket[]>([
    {
      id: "1",
      subject: "Problema com acesso aos flashcards",
      category: "Técnico",
      status: "em_andamento",
      priority: "media",
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      lastMessage: new Date(Date.now() - 30 * 60 * 1000),
      unreadCount: 1,
      studentId: "current-user", // Simula ticket do usuário atual
      studentName: "Você",
      studentEmail: "aluno@exemplo.com",
      messages: [
        {
          id: "1",
          content: "Olá! Estou com dificuldade para acessar os flashcards. Quando clico, a página fica carregando infinitamente.",
          sender: { name: "Você", role: "student", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          isRead: true
        },
        {
          id: "2",
          content: "Olá! Obrigado por entrar em contato. Vou verificar esse problema para você. Pode me dizer qual navegador está usando?",
          sender: { name: "Prof. Carlos", role: "teacher", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isRead: true
        },
        {
          id: "3",
          content: "Estou usando Chrome, versão mais recente. O problema persiste mesmo depois de limpar o cache.",
          sender: { name: "Você", role: "student", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isRead: true
        },
        {
          id: "4",
          content: "Perfeito! Identifiquei o problema. Era um bug em nossa atualização mais recente. Já foi corrigido. Pode tentar acessar novamente?",
          sender: { name: "Prof. Carlos", role: "teacher", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isRead: false
        }
      ]
    },
    {
      id: "2",
      subject: "Dúvida sobre cronograma de estudos",
      category: "Acadêmico",
      status: "aberto",
      priority: "baixa",
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      lastMessage: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      unreadCount: 0,
      studentId: "current-user", // Simula ticket do usuário atual
      studentName: "Você",
      studentEmail: "aluno@exemplo.com",
      messages: [
        {
          id: "1",
          content: "Gostaria de uma orientação sobre como organizar meu cronograma de estudos para o CIAAR.",
          sender: { name: "Você", role: "student", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          isRead: true
        }
      ]
    },
    {
      id: "3",
      subject: "Erro ao fazer download das provas",
      category: "Técnico",
      status: "resolvido",
      priority: "alta",
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      lastMessage: new Date(Date.now() - 2 * 60 * 60 * 1000),
      unreadCount: 0,
      studentId: "other-student-1",
      studentName: "Maria Silva",
      studentEmail: "maria@exemplo.com",
      messages: [
        {
          id: "1",
          content: "Não conseguo fazer download das provas do CIAAR 2023. O botão não responde.",
          sender: { name: "Maria Silva", role: "student", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          isRead: true
        },
        {
          id: "2",
          content: "Olá Maria! Verificamos e corrigimos o problema. As provas já estão disponíveis para download novamente.",
          sender: { name: "Admin João", role: "admin", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          isRead: true
        }
      ]
    },
    {
      id: "4",
      subject: "Solicitação de nova aula sobre Matemática",
      category: "Acadêmico",
      status: "em_andamento",
      priority: "media",
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      lastMessage: new Date(Date.now() - 1 * 60 * 60 * 1000),
      unreadCount: 2,
      studentId: "other-student-2",
      studentName: "Pedro Santos",
      studentEmail: "pedro@exemplo.com",
      messages: [
        {
          id: "1",
          content: "Seria possível agendar uma aula específica sobre logaritmos? Estou com dificuldade neste tópico.",
          sender: { name: "Pedro Santos", role: "student", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          isRead: true
        },
        {
          id: "2",
          content: "Claro Pedro! Vou organizar uma aula específica sobre logaritmos para a próxima semana. Agendarei para quinta-feira às 19h.",
          sender: { name: "Prof. Ana", role: "teacher", avatar: "/placeholder-user.jpg" },
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          isRead: false
        }
      ]
    }
  ]);

  const [tickets, setTickets] = useState<Ticket[]>([]);

  // Carregar role do usuário e filtrar tickets
  useEffect(() => {
    async function loadUserData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setCurrentUserId(user.id);
          const role = await getUserRoleClient(user.id);
          setUserRole(role as "student" | "teacher" | "admin");
          
          // Filtrar tickets baseado no role
          if (role === "student") {
            // Aluno vê apenas seus próprios tickets
            const userTickets = allTickets.filter(ticket => ticket.studentId === "current-user");
            setTickets(userTickets);
          } else if (role === "teacher" || role === "admin") {
            // Professor e Admin veem todos os tickets
            setTickets(allTickets);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar dados do usuário:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserData();
  }, [allTickets]);

  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: "1",
      question: "Como posso acessar os flashcards?",
      answer: "Para acessar os flashcards, vá até o menu lateral e clique em 'Flashcards'. Lá você encontrará todos os cards organizados por matéria e dificuldade. Você também pode acessar seus flashcards personalizados em 'Meus Flashcards'.",
      category: "Funcionalidades"
    },
    {
      id: "2", 
      question: "Posso fazer download das provas em PDF?",
      answer: "Sim! Todas as provas oficiais e simulados estão disponíveis para download em formato PDF. Acesse a seção 'Provas' no menu lateral e clique no botão 'Download PDF' da prova desejada.",
      category: "Provas"
    },
    {
      id: "3",
      question: "Como funciona o sistema de ranking?",
      answer: "O ranking é baseado em seu desempenho nos quizzes, flashcards completados, redações enviadas e participação na comunidade. Quanto mais você estuda e participa, maior sua posição no ranking geral.",
      category: "Gamificação"
    },
    {
      id: "4",
      question: "Posso enviar redações para correção?",
      answer: "Sim! Na seção 'Redação' você pode escrever e enviar suas redações para correção. Nossa equipe de professores fará a análise detalhada e você receberá feedback personalizado.",
      category: "Redação"
    },
    {
      id: "5",
      question: "Como participar das aulas ao vivo?",
      answer: "As aulas ao vivo são agendadas no calendário. Você recebe notificações por email e pode acessar através do link que aparece no calendário no horário da aula.",
      category: "Aulas"
    }
  ]);

  const toggleFAQ = (id: string) => {
    setFaqs(faqs.map(faq => 
      faq.id === id ? { ...faq, isOpen: !faq.isOpen } : faq
    ));
  };

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === "all" || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [...new Set(faqs.map(faq => faq.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "aberto": return "bg-blue-500/20 text-blue-600 border-blue-500/50";
      case "em_andamento": return "bg-yellow-500/20 text-yellow-600 border-yellow-500/50";
      case "resolvido": return "bg-green-500/20 text-green-600 border-green-500/50";
      case "fechado": return "bg-gray-500/20 text-gray-600 border-gray-500/50";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/50";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "baixa": return "bg-gray-500/20 text-gray-600 border-gray-500/50";
      case "media": return "bg-blue-500/20 text-blue-600 border-blue-500/50";
      case "alta": return "bg-orange-500/20 text-orange-600 border-orange-500/50";
      case "urgente": return "bg-red-500/20 text-red-600 border-red-500/50";
      default: return "bg-gray-500/20 text-gray-600 border-gray-500/50";
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}min atrás`;
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60);
      return `${hours}h atrás`;
    } else {
      const days = Math.floor(diffInMinutes / 1440);
      return `${days}d atrás`;
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const senderName = userRole === "student" ? "Você" : 
                      userRole === "teacher" ? "Professor" : "Admin";

    const message: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: { 
        name: senderName, 
        role: userRole || "student", 
        avatar: "/placeholder-user.jpg" 
      },
      timestamp: new Date(),
      isRead: true
    };

    const updatedTicket = {
      ...selectedTicket,
      messages: [...selectedTicket.messages, message],
      lastMessage: new Date(),
      status: "em_andamento" as const
    };

    setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
    setNewMessage("");
  };

  const openChat = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveView("chat");
    
    // Marcar mensagens como lidas
    const updatedTicket = {
      ...ticket,
      unreadCount: 0,
      messages: ticket.messages.map(m => ({ ...m, isRead: true }))
    };
    
    setTickets(tickets.map(t => t.id === ticket.id ? updatedTicket : t));
    setSelectedTicket(updatedTicket);
  };

  const canRespondToTickets = userRole === "teacher" || userRole === "admin";

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (activeView === "chat" && selectedTicket) {
    return (
      <DashboardShell>
        <div className="space-y-6">
          {/* Header do Chat */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveView("overview")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{selectedTicket.subject}</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(selectedTicket.status)}>
                  {selectedTicket.status.replace("_", " ")}
                </Badge>
                <Badge className={getPriorityColor(selectedTicket.priority)}>
                  {selectedTicket.priority}
                </Badge>
                {canRespondToTickets && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {selectedTicket.studentName} ({selectedTicket.studentEmail})
                  </Badge>
                )}
                <span className="text-sm text-muted-foreground">
                  Criado em {selectedTicket.createdAt.toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          </div>

          {/* Chat */}
          <Card className="h-[600px] flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Conversa
                {canRespondToTickets && (
                  <Badge variant="secondary" className="ml-auto flex items-center gap-1">
                    {userRole === "admin" ? <Crown className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                    {userRole === "admin" ? "Admin" : "Professor"}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              {/* Mensagens */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {selectedTicket.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.sender.role === "student" && !canRespondToTickets ? "justify-end" : 
                        message.sender.role !== "student" ? "justify-start" :
                        canRespondToTickets ? "justify-start" : "justify-end"
                      }`}
                    >
                      {((message.sender.role !== "student") || 
                        (message.sender.role === "student" && canRespondToTickets)) && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`max-w-[70%] p-3 rounded-lg ${
                          message.sender.role === "student" && !canRespondToTickets
                            ? "bg-orange-500 text-white"
                            : message.sender.role === "teacher"
                            ? "bg-blue-500/10 border border-blue-500/20"
                            : message.sender.role === "admin"
                            ? "bg-purple-500/10 border border-purple-500/20"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {message.sender.name}
                          </span>
                          {message.sender.role === "teacher" && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              Professor
                            </Badge>
                          )}
                          {message.sender.role === "admin" && (
                            <Badge variant="secondary" className="text-xs flex items-center gap-1">
                              <Crown className="h-3 w-3" />
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                      {((message.sender.role === "student" && !canRespondToTickets) ||
                        (canRespondToTickets && userRole === message.sender.role)) && (
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.sender.avatar} />
                          <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Input de mensagem */}
              <div className="border-t p-4">
                {canRespondToTickets ? (
                  <div className="mb-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                      {userRole === "admin" ? <Crown className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                      Respondendo como {userRole === "admin" ? "Administrador" : "Professor"}
                    </div>
                  </div>
                ) : null}
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Digite sua mensagem..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className={gradients.buttonOrange}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Pressione Enter para enviar ou Shift+Enter para quebrar linha
                </p>
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">Central de Suporte</h1>
              {canRespondToTickets && (
                <Badge className={gradients.buttonOrange + " flex items-center gap-1"}>
                  {userRole === "admin" ? <Crown className="h-3 w-3" /> : <Shield className="h-3 w-3" />}
                  {userRole === "admin" ? "Admin" : "Professor"}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              {canRespondToTickets 
                ? "Gerencie tickets de suporte de todos os alunos" 
                : "Tire suas dúvidas, encontre respostas e entre em contato com nossa equipe"
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Resposta em até 24h
            </Badge>
            {canRespondToTickets && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                {tickets.length} ticket{tickets.length !== 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="tickets">
              {canRespondToTickets ? "Todos os Tickets" : "Meus Tickets"}
            </TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="create" disabled={canRespondToTickets}>
              Novo Ticket
            </TabsTrigger>
          </TabsList>

          {/* Tickets */}
          <TabsContent value="tickets" className="space-y-6">
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-lg transition-all cursor-pointer" onClick={() => openChat(ticket)}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold">{ticket.subject}</h3>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace("_", " ")}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          {ticket.unreadCount > 0 && (
                            <Badge className={gradients.buttonOrange}>
                              {ticket.unreadCount} nova{ticket.unreadCount > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                          <span>Categoria: {ticket.category}</span>
                          {canRespondToTickets && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {ticket.studentName}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Criado: {formatTimeAgo(ticket.createdAt)}</span>
                          <span>Última mensagem: {formatTimeAgo(ticket.lastMessage)}</span>
                          <span>{ticket.messages.length} mensagens</span>
                        </div>
                      </div>
                      <MessageCircle className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))}

              {tickets.length === 0 && (
                <div className="text-center py-12">
                  <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    {canRespondToTickets ? "Nenhum ticket encontrado" : "Nenhum ticket encontrado"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {canRespondToTickets 
                      ? "Não há tickets de suporte no momento."
                      : "Você ainda não criou nenhum ticket de suporte."
                    }
                  </p>
                  {!canRespondToTickets && (
                    <Button className={gradients.buttonOrange}>
                      <Plus className="h-4 w-4 mr-2" />
                      Criar Primeiro Ticket
                    </Button>
                  )}
                </div>
              )}
            </div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HelpCircle className="h-5 w-5" />
                  Perguntas Frequentes
                </CardTitle>
                <CardDescription>
                  Encontre respostas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filtros FAQ */}
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar nas perguntas..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas as categorias</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de FAQs */}
                <div className="space-y-2">
                  {filteredFAQs.map((faq) => (
                    <Collapsible key={faq.id}>
                      <CollapsibleTrigger
                        onClick={() => toggleFAQ(faq.id)}
                        className="flex items-center justify-between w-full p-4 text-left bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary" className="text-xs">
                            {faq.category}
                          </Badge>
                          <span className="font-medium">{faq.question}</span>
                        </div>
                        {faq.isOpen ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </CollapsibleTrigger>
                      <CollapsibleContent className="px-4 pb-4">
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {faq.answer}
                        </p>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>

                {filteredFAQs.length === 0 && (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-muted-foreground">
                      Nenhuma pergunta encontrada com os filtros aplicados.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Criar Ticket Tab */}
          <TabsContent value="create" className="space-y-6">
            {canRespondToTickets ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Área Restrita</h3>
                  <p className="text-muted-foreground">
                    Como {userRole === "admin" ? "administrador" : "professor"}, você tem acesso para responder tickets, mas não pode criar novos tickets.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Criar Novo Ticket</CardTitle>
                  <CardDescription>
                    Descreva seu problema ou dúvida que nossa equipe entrará em contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="subject" className="block text-sm font-medium mb-1">
                          Assunto
                        </label>
                        <Input id="subject" placeholder="Descreva brevemente o problema" required />
                      </div>
                      
                      <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-1">
                          Categoria
                        </label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tecnico">Problema Técnico</SelectItem>
                            <SelectItem value="academico">Dúvida Acadêmica</SelectItem>
                            <SelectItem value="financeiro">Financeiro</SelectItem>
                            <SelectItem value="sugestao">Sugestão</SelectItem>
                            <SelectItem value="outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium mb-1">
                        Prioridade
                      </label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a prioridade" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baixa">Baixa</SelectItem>
                          <SelectItem value="media">Média</SelectItem>
                          <SelectItem value="alta">Alta</SelectItem>
                          <SelectItem value="urgente">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium mb-1">
                        Descrição Detalhada
                      </label>
                      <Textarea 
                        id="description" 
                        placeholder="Descreva seu problema ou dúvida em detalhes..." 
                        rows={6} 
                        required 
                      />
                    </div>
                    
                    <Button type="submit" className={`w-full ${gradients.buttonOrange}`}>
                      <Send className="h-4 w-4 mr-2" />
                      Criar Ticket
                    </Button>
                  </form>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
} 