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
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

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

  // Estados para FAQ
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());

  // Estados para tickets
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "media" as const,
    description: ""
  });

  const supabase = createClient();

  useEffect(() => {
    loadUserData();
    loadFAQs();
    loadTickets();
  }, []);

  async function loadUserData() {
    try {
      setIsLoading(true);
      
      // Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        
        // Verificar role do usuário
        const role = await getUserRoleClient(user.id);
        setUserRole(role as any);
      }
      
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const loadFAQs = async () => {
    try {
      // Simular carregamento de FAQs
      const faqsMock: FAQ[] = [
        {
          id: "1",
          question: "Como acessar os flashcards?",
          answer: "Para acessar os flashcards, vá para a seção 'Flashcards' no menu lateral. Lá você encontrará todos os flashcards disponíveis organizados por matéria e tópico.",
          category: "Geral"
        },
        {
          id: "2",
          question: "Como funciona o sistema de revisão?",
          answer: "O sistema de revisão utiliza o algoritmo SM-2 para determinar quando você deve revisar cada flashcard. Quanto melhor você se lembrar, mais tempo até a próxima revisão.",
          category: "Estudo"
        },
        {
          id: "3",
          question: "Posso baixar os materiais?",
          answer: "Sim! Na seção 'Livros' você pode baixar todos os materiais disponíveis. Basta clicar no botão 'Baixar' ao lado de cada arquivo.",
          category: "Materiais"
        },
        {
          id: "4",
          question: "Como criar flashcards personalizados?",
          answer: "Para criar flashcards personalizados, vá para 'Meus Flashcards' e clique em 'Criar Novo'. Você pode adicionar suas próprias perguntas e respostas.",
          category: "Personalização"
        },
        {
          id: "5",
          question: "Como funciona o sistema de provas?",
          answer: "O sistema de provas permite que você pratique com questões simuladas. As provas têm tempo limite e você recebe feedback imediato sobre seu desempenho.",
          category: "Provas"
        },
        {
          id: "6",
          question: "Esqueci minha senha, o que fazer?",
          answer: "Na tela de login, clique em 'Esqueci minha senha' e siga as instruções para redefinir sua senha através do email cadastrado.",
          category: "Conta"
        }
      ];
      
      setFaqs(faqsMock);
    } catch (error) {
      console.error("Erro ao carregar FAQs:", error);
    }
  };

  const loadTickets = async () => {
    try {
      // Simular carregamento de tickets
      const ticketsMock: Ticket[] = [
        {
          id: "1",
          subject: "Problema com login",
          category: "Conta",
          status: "aberto",
          priority: "alta",
          createdAt: new Date("2024-01-15"),
          lastMessage: new Date("2024-01-15T14:30:00"),
          unreadCount: 1,
          studentId: "user1",
          studentName: "João Silva",
          studentEmail: "joao@email.com",
          messages: [
            {
              id: "msg1",
              content: "Não consigo fazer login no sistema. Aparece erro de senha incorreta.",
              sender: {
                name: "João Silva",
                role: "student",
                avatar: "/avatars/joao.jpg"
              },
              timestamp: new Date("2024-01-15T14:30:00"),
              isRead: false
            }
          ]
        },
        {
          id: "2",
          subject: "Flashcard não carrega",
          category: "Técnico",
          status: "em_andamento",
          priority: "media",
          createdAt: new Date("2024-01-14"),
          lastMessage: new Date("2024-01-15T10:15:00"),
          unreadCount: 0,
          studentId: "user2",
          studentName: "Maria Santos",
          studentEmail: "maria@email.com",
          messages: [
            {
              id: "msg2",
              content: "Os flashcards de português não estão carregando. Pode ajudar?",
              sender: {
                name: "Maria Santos",
                role: "student",
                avatar: "/avatars/maria.jpg"
              },
              timestamp: new Date("2024-01-14T16:45:00"),
              isRead: true
            },
            {
              id: "msg3",
              content: "Olá Maria! Vou verificar isso para você. Pode me dizer qual navegador está usando?",
              sender: {
                name: "Suporte Everest",
                role: "admin",
                avatar: "/avatars/support.jpg"
              },
              timestamp: new Date("2024-01-15T10:15:00"),
              isRead: true
            }
          ]
        }
      ];
      
      setTickets(ticketsMock);
    } catch (error) {
      console.error("Erro ao carregar tickets:", error);
    }
  };

  const toggleFAQ = (id: string) => {
    const newExpanded = new Set(expandedFaqs);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFaqs(newExpanded);
  };

  const getStatusColor = (status: string) => {
    const colors: {[key: string]: string} = {
      "aberto": "bg-blue-100 text-blue-800",
      "em_andamento": "bg-yellow-100 text-yellow-800",
      "resolvido": "bg-green-100 text-green-800",
      "fechado": "bg-gray-100 text-gray-800"
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPriorityColor = (priority: string) => {
    const colors: {[key: string]: string} = {
      "baixa": "bg-green-100 text-green-800",
      "media": "bg-yellow-100 text-yellow-800",
      "alta": "bg-orange-100 text-orange-800",
      "urgente": "bg-red-100 text-red-800"
    };
    return colors[priority] || "bg-gray-100 text-gray-800";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return `${Math.floor(diffInMinutes / 1440)}d atrás`;
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;

    const newMsg: Message = {
      id: `msg${Date.now()}`,
      content: newMessage,
      sender: {
        name: userRole === "student" ? "Você" : "Suporte Everest",
        role: userRole === "student" ? "student" : "admin",
        avatar: userRole === "student" ? "/avatars/user.jpg" : "/avatars/support.jpg"
      },
      timestamp: new Date(),
      isRead: false
    };

    setSelectedTicket({
      ...selectedTicket,
      messages: [...selectedTicket.messages, newMsg],
      lastMessage: new Date(),
      unreadCount: 0
    });

    setNewMessage("");
  };

  const openChat = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveView("chat");
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       ticket.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategory = selectedCategory === "all" || ticket.category === selectedCategory;
    
    return matchSearch && matchCategory;
  });

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suporte</h1>
          <p className="text-muted-foreground">
            Central de ajuda e suporte técnico
          </p>
        </div>
        {activeView === "chat" && (
          <Button
            variant="outline"
            onClick={() => setActiveView("overview")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        )}
      </div>

      {activeView === "overview" ? (
        <div className="space-y-6">
          {/* Cards de Estatísticas */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tickets.filter(t => t.status === "aberto").length}</div>
                <p className="text-xs text-muted-foreground">
                  +2 desde ontem
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tickets.filter(t => t.status === "em_andamento").length}</div>
                <p className="text-xs text-muted-foreground">
                  +1 desde ontem
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tickets.filter(t => t.status === "resolvido").length}</div>
                <p className="text-xs text-muted-foreground">
                  +5 esta semana
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.4h</div>
                <p className="text-xs text-muted-foreground">
                  Tempo de resposta
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="faq" className="space-y-4">
            <TabsList>
              <TabsTrigger value="faq">FAQ</TabsTrigger>
              <TabsTrigger value="tickets">Tickets de Suporte</TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Perguntas Frequentes</CardTitle>
                      <CardDescription>
                        Encontre respostas para as dúvidas mais comuns
                      </CardDescription>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Buscar nas FAQs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-[300px]"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredFaqs.map((faq) => (
                      <Collapsible
                        key={faq.id}
                        open={expandedFaqs.has(faq.id)}
                        onOpenChange={() => toggleFAQ(faq.id)}
                      >
                        <CollapsibleTrigger asChild>
                          <Button
                            variant="ghost"
                            className="w-full justify-between p-4 h-auto"
                          >
                            <div className="text-left">
                              <div className="font-medium">{faq.question}</div>
                              <div className="text-sm text-muted-foreground mt-1">
                                {faq.category}
                              </div>
                            </div>
                            {expandedFaqs.has(faq.id) ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                          <div className="text-sm text-muted-foreground leading-relaxed">
                            {faq.answer}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tickets" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Tickets de Suporte</CardTitle>
                      <CardDescription>
                        Gerencie suas solicitações de suporte
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todas as categorias</SelectItem>
                          <SelectItem value="Conta">Conta</SelectItem>
                          <SelectItem value="Técnico">Técnico</SelectItem>
                          <SelectItem value="Pagamento">Pagamento</SelectItem>
                          <SelectItem value="Estudo">Estudo</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar tickets..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-[250px]"
                        />
                      </div>
                      <Button onClick={() => setShowNewTicketDialog(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Ticket
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => openChat(ticket)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="text-sm text-muted-foreground">
                              {ticket.studentName} • {ticket.category}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <div className="text-sm text-muted-foreground">
                            {formatTimeAgo(ticket.lastMessage)}
                          </div>
                          {ticket.unreadCount > 0 && (
                            <Badge variant="destructive" className="ml-2">
                              {ticket.unreadCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {filteredTickets.length === 0 && (
                      <div className="text-center py-8">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-2 text-sm font-semibold">Nenhum ticket encontrado</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {searchTerm ? "Tente ajustar os filtros." : "Crie seu primeiro ticket de suporte."}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Chat View
        <div className="space-y-4">
          {selectedTicket && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <CardDescription>
                      {selectedTicket.studentName} • {selectedTicket.category}
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {selectedTicket.status}
                    </Badge>
                    <Badge className={getPriorityColor(selectedTicket.priority)}>
                      {selectedTicket.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {selectedTicket.messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.sender.role === "student" ? "justify-start" : "justify-end"}`}
                        >
                          <div className={`flex items-start gap-3 max-w-[70%] ${message.sender.role === "student" ? "" : "flex-row-reverse"}`}>
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={message.sender.avatar} />
                              <AvatarFallback>
                                {message.sender.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`rounded-lg p-3 ${
                              message.sender.role === "student" 
                                ? "bg-muted" 
                                : "bg-primary text-primary-foreground"
                            }`}>
                              <div className="text-sm">{message.content}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {formatTimeAgo(message.timestamp)}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1"
                      rows={2}
                    />
                    <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog para novo ticket */}
      <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Criar Novo Ticket</DialogTitle>
            <DialogDescription>
              Descreva seu problema para que possamos ajudá-lo
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Assunto</Label>
              <Input
                id="subject"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                placeholder="Ex: Problema com login"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Conta">Conta</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Pagamento">Pagamento</SelectItem>
                    <SelectItem value="Estudo">Estudo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridade</Label>
                <Select value={newTicket.priority} onValueChange={(value: any) => setNewTicket({...newTicket, priority: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="media">Média</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={newTicket.description}
                onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                placeholder="Descreva detalhadamente o problema que está enfrentando..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewTicketDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={() => {
                // Implementar criação do ticket
                toast.success("Ticket criado com sucesso!");
                setShowNewTicketDialog(false);
                setNewTicket({
                  subject: "",
                  category: "",
                  priority: "media",
                  description: ""
                });
              }}>
                <Send className="mr-2 h-4 w-4" />
                Enviar Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
} 