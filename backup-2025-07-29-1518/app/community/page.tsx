"use client";

import { useState, useEffect } from "react";
import { DashboardShell } from "@/components/dashboard-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { gradients } from "@/lib/gradients";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Send,
  Image as ImageIcon,
  Smile,
  ThumbsUp,
  Users,
  TrendingUp,
  Pin,
  Clock,
  Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    role: "student" | "teacher" | "admin";
  };
  content: string;
  image?: string;
  timestamp: Date;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  pinned?: boolean;
  tags?: string[];
}

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  timestamp: Date;
  likes: number;
}

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      author: {
        name: "Prof. Carlos Silva",
        avatar: "/placeholder-user.jpg",
        role: "teacher"
      },
      content: "Pessoal, preparei uma lista especial de exercícios sobre análise sintática que vai ajudar muito vocês nos estudos. Foquem especialmente nos exercícios 5 ao 10, que são mais complexos. Qualquer dúvida, postem aqui! 📚✨",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
      likes: 24,
      comments: 12,
      shares: 3,
      liked: false,
      pinned: true,
      tags: ["português", "análise-sintática"]
    },
    {
      id: "2",
      author: {
        name: "Maria Santos",
        avatar: "/placeholder-user.jpg",
        role: "student"
      },
      content: "Consegui finalmente entender subordinadas substantivas! 🎉 O método que o prof. Carlos ensinou na última live foi incrível. Quem mais conseguiu aplicar? Vamos compartilhar as dicas! 💪",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
      likes: 15,
      comments: 8,
      shares: 2,
      liked: true,
      tags: ["português", "subordinadas"]
    },
    {
      id: "3",
      author: {
        name: "João Pereira",
        avatar: "/placeholder-user.jpg",
        role: "student"
      },
      content: "Galera, alguém pode me ajudar com redação dissertativa? Estou com dificuldade na conclusão. Como vocês fazem para retomar a tese de forma criativa?",
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
      likes: 8,
      comments: 15,
      shares: 1,
      liked: false,
      tags: ["redação", "dissertação"]
    }
  ]);

  const [newPost, setNewPost] = useState("");

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return "Agora há pouco";
    } else if (diffInHours < 24) {
      return `${diffInHours}h atrás`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d atrás`;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "teacher":
        return <Badge className="text-xs bg-orange-500/20 text-orange-600 border-orange-500/50">Professor</Badge>;
      case "admin":
        return <Badge className="text-xs bg-purple-500/20 text-purple-600 border-purple-500/50">Admin</Badge>;
      default:
        return <Badge variant="secondary" className="text-xs">Aluno</Badge>;
    }
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { 
            ...post, 
            liked: !post.liked, 
            likes: post.liked ? post.likes - 1 : post.likes + 1 
          }
        : post
    ));
  };

  const handleCreatePost = () => {
    if (!newPost.trim()) return;
    
    const post: Post = {
      id: Date.now().toString(),
      author: {
        name: "Você",
        avatar: "/placeholder-user.jpg",
        role: "student"
      },
      content: newPost,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      shares: 0,
      liked: false
    };
    
    setPosts([post, ...posts]);
    setNewPost("");
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Comunidade</h1>
            <p className="text-muted-foreground mt-1">
              Conecte-se com outros alunos e professores, tire dúvidas e compartilhe conhecimento
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              156 membros online
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Feed Principal */}
          <div className="lg:col-span-3 space-y-6">
            {/* Criar Post */}
            <Card>
              <CardContent className="p-6">
                <div className="flex gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="/placeholder-user.jpg" />
                    <AvatarFallback>Você</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-3">
                    <Textarea
                      placeholder="Compartilhe uma dúvida, dica ou conquista..."
                      value={newPost}
                      onChange={(e) => setNewPost(e.target.value)}
                      className="min-h-[80px] resize-none border-0 focus-visible:ring-0 bg-muted/50"
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <ImageIcon className="h-4 w-4 mr-1" />
                          Foto
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Smile className="h-4 w-4 mr-1" />
                          Emoji
                        </Button>
                      </div>
                      <Button 
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className={gradients.buttonOrange}
                        size="sm"
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Publicar
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Posts Feed */}
            <div className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className={post.pinned ? "border-orange-500/30 bg-orange-500/5" : ""}>
                  <CardContent className="p-6">
                    {/* Header do Post */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author.avatar} />
                          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-sm">{post.author.name}</h4>
                            {getRoleBadge(post.author.role)}
                            {post.pinned && <Pin className="h-3 w-3 text-orange-500" />}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(post.timestamp)}
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Denunciar</DropdownMenuItem>
                          <DropdownMenuItem>Ocultar post</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Conteúdo do Post */}
                    <div className="mb-4">
                      <p className="text-sm leading-relaxed">{post.content}</p>
                      {post.tags && (
                        <div className="flex gap-1 mt-3">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    {/* Estatísticas de Interação */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" />
                          {post.likes} curtidas
                        </span>
                        <span>{post.comments} comentários</span>
                        <span>{post.shares} compartilhamentos</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        234 visualizações
                      </div>
                    </div>

                    <Separator className="my-3" />

                    {/* Botões de Ação */}
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2 ${post.liked ? 'text-red-500' : ''}`}
                      >
                        <Heart className={`h-4 w-4 ${post.liked ? 'fill-current' : ''}`} />
                        Curtir
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <MessageCircle className="h-4 w-4" />
                        Comentar
                      </Button>
                      
                      <Button variant="ghost" size="sm" className="flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Compartilhar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Estatísticas da Comunidade */}
            <Card className={`${gradients.cardOrange} border-orange-500/20`}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className={`h-5 w-5 ${gradients.textOrange}`} />
                  Estatísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Posts hoje</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Membros ativos</span>
                  <Badge variant="secondary">89</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Dúvidas resolvidas</span>
                  <Badge className={gradients.buttonOrange}>7</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Tópicos Populares */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Tópicos Populares</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { tag: "análise-sintática", posts: 15 },
                  { tag: "redação", posts: 12 },
                  { tag: "subordinadas", posts: 8 },
                  { tag: "simulado", posts: 6 },
                  { tag: "dúvidas", posts: 24 }
                ].map((topic, index) => (
                  <div key={index} className="flex justify-between items-center p-2 rounded-lg hover:bg-accent cursor-pointer">
                    <span className="text-sm">#{topic.tag}</span>
                    <Badge variant="outline" className="text-xs">{topic.posts}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Membros Online */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Membros Online</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Ana Costa", role: "student" },
                  { name: "Prof. Silva", role: "teacher" },
                  { name: "Pedro Lima", role: "student" },
                  { name: "Julia Santos", role: "student" }
                ].map((member, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="relative">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" />
                        <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{member.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {member.role === "teacher" ? "Professor" : "Aluno"}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
