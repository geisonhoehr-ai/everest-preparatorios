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
  Crown,
  Star,
  Zap,
  Users,
  Headphones,
  BookOpen,
  Settings,
  Lightbulb,
  Heart,
  Award,
  TrendingUp,
  Activity,
  Edit,
  Trash2,
  Save,
  X
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
  studentId: string;
  studentName: string;
  studentEmail: string;
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

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [expandedFaqs, setExpandedFaqs] = useState<Set<string>>(new Set());
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [showNewTicketDialog, setShowNewTicketDialog] = useState(false);
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "media" as const,
    description: ""
  });

  // Estados para edição de FAQs
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);
  const [showEditFAQDialog, setShowEditFAQDialog] = useState(false);
  const [showNewFAQDialog, setShowNewFAQDialog] = useState(false);
  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category: ""
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
      
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
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
          answer: "Sim! Na seção 'Acervo Digital' você pode baixar todos os materiais disponíveis. Basta clicar no botão 'Baixar' ao lado de cada arquivo.",
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
      "aberto": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      "em_andamento": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      "resolvido": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      "fechado": "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    };
    return colors[status] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const getPriorityColor = (priority: string) => {
    const colors: {[key: string]: string} = {
      "baixa": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      "media": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      "alta": "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      "urgente": "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
    };
    return colors[priority] || "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300";
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Agora mesmo";
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInHours < 48) return "Ontem";
    return date.toLocaleDateString('pt-BR');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    // Simular envio de mensagem
    const newMsg: Message = {
      id: Date.now().toString(),
      content: newMessage,
      sender: {
        name: userRole === "admin" ? "Suporte Everest" : "Você",
        role: userRole || "student",
        avatar: "/avatars/user.jpg"
      },
      timestamp: new Date(),
      isRead: false
    };
    
    selectedTicket.messages.push(newMsg);
    setNewMessage("");
    toast.success("Mensagem enviada!");
  };

  const openChat = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setActiveView("chat");
  };

  // Funções para gerenciar FAQs
  const handleEditFAQ = (faq: FAQ) => {
    setEditingFAQ(faq);
    setShowEditFAQDialog(true);
  };

  const handleSaveFAQ = () => {
    if (!editingFAQ) return;
    
    const updatedFaqs = faqs.map(faq => 
      faq.id === editingFAQ.id ? editingFAQ : faq
    );
    setFaqs(updatedFaqs);
    setShowEditFAQDialog(false);
    setEditingFAQ(null);
    toast.success("FAQ atualizada com sucesso!");
  };

  const handleDeleteFAQ = (faqId: string) => {
    const updatedFaqs = faqs.filter(faq => faq.id !== faqId);
    setFaqs(updatedFaqs);
    toast.success("FAQ removida com sucesso!");
  };

  const handleCreateFAQ = () => {
    if (!newFAQ.question || !newFAQ.answer || !newFAQ.category) {
      toast.error("Preencha todos os campos!");
      return;
    }

    const newFAQItem: FAQ = {
      id: Date.now().toString(),
      question: newFAQ.question,
      answer: newFAQ.answer,
      category: newFAQ.category
    };

    setFaqs([...faqs, newFAQItem]);
    setShowNewFAQDialog(false);
    setNewFAQ({ question: "", answer: "", category: "" });
    toast.success("FAQ criada com sucesso!");
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

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="h-4 w-4" />;
      case "teacher": return <Shield className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "text-purple-600 dark:text-purple-400";
      case "teacher": return "text-blue-600 dark:text-blue-400";
      default: return "text-orange-600 dark:text-orange-400";
    }
  };

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando suporte...</p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      {/* Header com gradiente */}
      <div className={`${gradients.cardOrange} rounded-xl p-6 mb-6 border border-orange-200/20 dark:border-orange-800/20`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`${gradients.orange} p-3 rounded-lg`}>
              <Headphones className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Central de Suporte
              </h1>
              <p className="text-muted-foreground mt-1">
                Estamos aqui para ajudar você a ter a melhor experiência possível
              </p>
            </div>
          </div>
          {activeView === "chat" && (
            <Button
              variant="outline"
              onClick={() => setActiveView("overview")}
              className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}
        </div>
      </div>

      {activeView === "overview" ? (
        <div className="space-y-6">
          {/* Cards de Estatísticas com gradientes */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className={`${gradients.cardOrange} border-orange-200/20 dark:border-orange-800/20`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tickets Abertos</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {tickets.filter(t => t.status === "aberto").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 desde ontem
                </p>
              </CardContent>
            </Card>
            
            <Card className={`${gradients.cardBlue} border-blue-200/20 dark:border-blue-800/20`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
                <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {tickets.filter(t => t.status === "em_andamento").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +1 desde ontem
                </p>
              </CardContent>
            </Card>
            
            <Card className={`${gradients.cardGreen} border-green-200/20 dark:border-green-800/20`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Resolvidos</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {tickets.filter(t => t.status === "resolvido").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  +5 esta semana
                </p>
              </CardContent>
            </Card>
            
            <Card className={`${gradients.cardPurple} border-purple-200/20 dark:border-purple-800/20`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
                <Activity className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  2.4h
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo de resposta
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Acesso Rápido */}
          <Card className="border-orange-200/20 dark:border-orange-800/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                Acesso Rápido
              </CardTitle>
              <CardDescription>
                Encontre ajuda rapidamente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
                  onClick={() => setShowNewTicketDialog(true)}
                >
                  <Plus className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  <span className="font-medium">Novo Ticket</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Criar solicitação de suporte
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 border-blue-200 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-950"
                >
                  <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">Base de Conhecimento</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Artigos e tutoriais
                  </span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex-col gap-2 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-950"
                >
                  <MessageCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <span className="font-medium">Chat ao Vivo</span>
                  <span className="text-xs text-muted-foreground text-center">
                    Falar com suporte
                  </span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="faq" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="faq" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                FAQ
              </TabsTrigger>
              <TabsTrigger value="tickets" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Tickets de Suporte
              </TabsTrigger>
            </TabsList>

            <TabsContent value="faq" className="space-y-4">
              <Card className="border-orange-200/20 dark:border-orange-800/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Perguntas Frequentes
                      </CardTitle>
                      <CardDescription>
                        Encontre respostas para as dúvidas mais comuns
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Buscar nas FAQs..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 w-[300px] border-orange-200 focus:border-orange-500"
                        />
                      </div>
                      {(userRole === "teacher" || userRole === "admin") && (
                        <Button 
                          onClick={() => setShowNewFAQDialog(true)}
                          className={`${gradients.buttonOrange} text-white`}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Nova FAQ
                        </Button>
                      )}
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
                            className="w-full justify-between p-4 h-auto hover:bg-orange-50 dark:hover:bg-orange-950"
                          >
                            <div className="text-left">
                              <div className="font-medium">{faq.question}</div>
                              <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {faq.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {(userRole === "teacher" || userRole === "admin") && (
                                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditFAQ(faq)}
                                    className="h-8 w-8 p-0 hover:bg-orange-100 dark:hover:bg-orange-900"
                                  >
                                    <Edit className="h-3 w-3 text-orange-600 dark:text-orange-400" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteFAQ(faq.id)}
                                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900"
                                  >
                                    <Trash2 className="h-3 w-3 text-red-600 dark:text-red-400" />
                                  </Button>
                                </div>
                              )}
                              {expandedFaqs.has(faq.id) ? (
                                <ChevronUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              ) : (
                                <ChevronDown className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                              )}
                            </div>
                          </Button>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="px-4 pb-4">
                          <div className="text-sm text-muted-foreground leading-relaxed bg-orange-50 dark:bg-orange-950/30 p-4 rounded-lg">
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
              <Card className="border-orange-200/20 dark:border-orange-800/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        Tickets de Suporte
                      </CardTitle>
                      <CardDescription>
                        Gerencie suas solicitações de suporte
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-4">
                      <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="w-[180px] border-orange-200 focus:border-orange-500">
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
                          className="pl-10 w-[250px] border-orange-200 focus:border-orange-500"
                        />
                      </div>
                      <Button 
                        onClick={() => setShowNewTicketDialog(true)}
                        className={`${gradients.buttonOrange} text-white`}
                      >
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
                        className="flex items-center justify-between p-4 border border-orange-200/20 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer transition-colors"
                        onClick={() => openChat(ticket)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <div className="font-medium">{ticket.subject}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                              <User className="h-3 w-3" />
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
                      <div className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Nenhum ticket encontrado</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {searchTerm ? "Tente ajustar os filtros." : "Crie seu primeiro ticket de suporte."}
                        </p>
                        {!searchTerm && (
                          <Button 
                            onClick={() => setShowNewTicketDialog(true)}
                            className={`${gradients.buttonOrange} text-white`}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Criar Primeiro Ticket
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      ) : (
        // Chat View com design melhorado
        <div className="space-y-4">
          {selectedTicket && (
            <Card className="border-orange-200/20 dark:border-orange-800/20">
              <CardHeader className={`${gradients.cardOrange} rounded-t-lg`}>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white">{selectedTicket.subject}</CardTitle>
                    <CardDescription className="text-orange-100">
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
              <CardContent className="p-0">
                <div className="space-y-4 p-6">
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
                              <AvatarFallback className="bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-300">
                                {message.sender.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className={`rounded-lg p-3 ${
                              message.sender.role === "student" 
                                ? "bg-gray-100 dark:bg-gray-800" 
                                : `${gradients.orange} text-white`
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
                  
                  <div className="flex gap-2 pt-4 border-t border-orange-200/20">
                    <Textarea
                      placeholder="Digite sua mensagem..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="flex-1 border-orange-200 focus:border-orange-500"
                      rows={2}
                    />
                    <Button 
                      onClick={handleSendMessage} 
                      disabled={!newMessage.trim()}
                      className={`${gradients.buttonOrange} text-white`}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog para novo ticket com design melhorado */}
      <Dialog open={showNewTicketDialog} onOpenChange={setShowNewTicketDialog}>
        <DialogContent className="max-w-2xl border-orange-200/20">
          <DialogHeader className={`${gradients.cardOrange} rounded-t-lg -m-6 mb-6 p-6`}>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Novo Ticket
            </DialogTitle>
            <DialogDescription className="text-orange-100">
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
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <Select value={newTicket.category} onValueChange={(value) => setNewTicket({...newTicket, category: value})}>
                  <SelectTrigger className="border-orange-200 focus:border-orange-500">
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
                  <SelectTrigger className="border-orange-200 focus:border-orange-500">
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
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewTicketDialog(false)}
                className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => {
                  toast.success("Ticket criado com sucesso!");
                  setShowNewTicketDialog(false);
                  setNewTicket({
                    subject: "",
                    category: "",
                    priority: "media",
                    description: ""
                  });
                }}
                className={`${gradients.buttonOrange} text-white`}
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar Ticket
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar FAQ */}
      <Dialog open={showEditFAQDialog} onOpenChange={setShowEditFAQDialog}>
        <DialogContent className="max-w-2xl border-orange-200/20">
          <DialogHeader className={`${gradients.cardOrange} rounded-t-lg -m-6 mb-6 p-6`}>
            <DialogTitle className="text-white flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Editar FAQ
            </DialogTitle>
            <DialogDescription className="text-orange-100">
              Atualize as informações da pergunta frequente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-question">Pergunta</Label>
              <Input
                id="edit-question"
                value={editingFAQ?.question || ""}
                onChange={(e) => setEditingFAQ(editingFAQ ? {...editingFAQ, question: e.target.value} : null)}
                placeholder="Digite a pergunta..."
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Categoria</Label>
              <Select 
                value={editingFAQ?.category || ""} 
                onValueChange={(value) => setEditingFAQ(editingFAQ ? {...editingFAQ, category: value} : null)}
              >
                <SelectTrigger className="border-orange-200 focus:border-orange-500">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral</SelectItem>
                  <SelectItem value="Estudo">Estudo</SelectItem>
                  <SelectItem value="Materiais">Materiais</SelectItem>
                  <SelectItem value="Personalização">Personalização</SelectItem>
                  <SelectItem value="Provas">Provas</SelectItem>
                  <SelectItem value="Conta">Conta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-answer">Resposta</Label>
              <Textarea
                id="edit-answer"
                value={editingFAQ?.answer || ""}
                onChange={(e) => setEditingFAQ(editingFAQ ? {...editingFAQ, answer: e.target.value} : null)}
                placeholder="Digite a resposta detalhada..."
                rows={6}
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditFAQDialog(false)}
                className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSaveFAQ}
                className={`${gradients.buttonOrange} text-white`}
              >
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para criar nova FAQ */}
      <Dialog open={showNewFAQDialog} onOpenChange={setShowNewFAQDialog}>
        <DialogContent className="max-w-2xl border-orange-200/20">
          <DialogHeader className={`${gradients.cardOrange} rounded-t-lg -m-6 mb-6 p-6`}>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Criar Nova FAQ
            </DialogTitle>
            <DialogDescription className="text-orange-100">
              Adicione uma nova pergunta frequente para ajudar os usuários
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-question">Pergunta</Label>
              <Input
                id="new-question"
                value={newFAQ.question}
                onChange={(e) => setNewFAQ({...newFAQ, question: e.target.value})}
                placeholder="Digite a pergunta..."
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-category">Categoria</Label>
              <Select 
                value={newFAQ.category} 
                onValueChange={(value) => setNewFAQ({...newFAQ, category: value})}
              >
                <SelectTrigger className="border-orange-200 focus:border-orange-500">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Geral</SelectItem>
                  <SelectItem value="Estudo">Estudo</SelectItem>
                  <SelectItem value="Materiais">Materiais</SelectItem>
                  <SelectItem value="Personalização">Personalização</SelectItem>
                  <SelectItem value="Provas">Provas</SelectItem>
                  <SelectItem value="Conta">Conta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new-answer">Resposta</Label>
              <Textarea
                id="new-answer"
                value={newFAQ.answer}
                onChange={(e) => setNewFAQ({...newFAQ, answer: e.target.value})}
                placeholder="Digite a resposta detalhada..."
                rows={6}
                className="border-orange-200 focus:border-orange-500"
              />
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewFAQDialog(false)}
                className="border-orange-200 hover:bg-orange-50 dark:border-orange-800 dark:hover:bg-orange-950"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateFAQ}
                className={`${gradients.buttonOrange} text-white`}
              >
                <Plus className="mr-2 h-4 w-4" />
                Criar FAQ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
} 