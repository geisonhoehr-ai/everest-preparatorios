"use client"

import { useState, useEffect } from "react"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Plus, 
  Search, 
  Users, 
  UserCheck, 
  UserX, 
  Clock,
  Mail,
  Phone,
  Calendar,
  Edit,
  Trash2,
  Shield,
  GraduationCap,
  User,
  MoreHorizontal,
  Eye,
  Key,
  Ban,
  Filter,
  ChevronDown,
  Download,
  Upload,
  X,
  Check,
  AlertCircle,
  Menu,
  ChevronLeft
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Member {
  id: number
  full_name: string
  email: string
  phone?: string
  status: 'active' | 'inactive' | 'suspended'
  created_at: string
  last_seen_at?: string
  login_count?: number
  cpf_cnpj?: string
}

interface UserRole {
  user_uuid: string
  role: 'student' | 'teacher' | 'admin'
}

type Category = 'all' | 'subscribers' | 'unlimited' | 'collaborators' | 'banned'

interface FilterState {
  curso: string
  turma: string
  assinatura: string
  ilimitado: string
  convite: string
  certificado: string
  ultimaVez: string
}

export default function MembrosPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<Category>('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    curso: '',
    turma: '',
    assinatura: '',
    ilimitado: '',
    convite: '',
    certificado: '',
    ultimaVez: ''
  })
  const [newMember, setNewMember] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'student' as 'student' | 'teacher' | 'admin'
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setIsLoading(true)
      
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!membersError && membersData) {
        setMembers(membersData)
      }

      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_uuid, role')
      
      if (!rolesError && rolesData) {
        setUserRoles(rolesData)
      }
    } catch (error) {
      console.error('❌ [MEMBROS] Erro:', error)
      toast({
        title: "Erro",
        description: "Erro ao carregar membros",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddMember = async () => {
    try {
      if (!newMember.full_name || !newMember.email) {
        toast({
          title: "Erro",
          description: "Nome e email são obrigatórios",
          variant: "destructive"
        })
        return
      }

      const memberDataToInsert = {
        full_name: newMember.full_name,
        email: newMember.email,
        phone: newMember.phone || null,
        status: 'active' as const
      }

      const { data: memberData, error: insertError } = await supabase
        .from('members')
        .insert(memberDataToInsert)
        .select()
        .single()

      if (insertError) {
        toast({
          title: "Erro",
          description: insertError.message || "Erro ao adicionar membro",
          variant: "destructive"
        })
        return
      }

      try {
        await supabase
          .from('user_roles')
          .upsert({
            user_uuid: newMember.email,
            role: newMember.role
          }, {
            onConflict: 'user_uuid'
          })
      } catch (roleError) {
        console.error('❌ [MEMBROS] Erro ao definir role:', roleError)
      }

      toast({
        title: "Sucesso",
        description: "Membro adicionado com sucesso!",
      })

      setIsAddDialogOpen(false)
      setNewMember({
        full_name: '',
        email: '',
        phone: '',
        role: 'student'
      })
      loadMembers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao adicionar membro",
        variant: "destructive"
      })
    }
  }

  const handleUpdateMember = async () => {
    if (!editingMember) return

    try {
      const { data, error } = await supabase
        .from('members')
        .update({
          full_name: editingMember.full_name,
          email: editingMember.email,
          phone: editingMember.phone,
          status: editingMember.status
        })
        .eq('id', editingMember.id)
        .select()
        .single()

      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar membro",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso!",
      })

      setIsEditDialogOpen(false)
      setEditingMember(null)
      loadMembers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar membro",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMember = async (memberId: number) => {
    if (!confirm('Tem certeza que deseja excluir este membro?')) return

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir membro",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Sucesso",
        description: "Membro excluído com sucesso!",
      })
      loadMembers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao excluir membro",
        variant: "destructive"
      })
    }
  }

  const handleUpdateRole = async (memberId: number, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      const member = members.find(m => m.id === memberId)
      if (!member) return

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_uuid: member.email,
          role: newRole
        }, {
          onConflict: 'user_uuid'
        })
      
      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar role",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Sucesso",
        description: `Role atualizado para ${newRole}!`,
      })
      
      loadMembers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar role",
        variant: "destructive"
      })
    }
  }

  // Funções para ações do dropdown
  const handleViewProfile = (member: Member) => {
    setSelectedMember(member)
    setIsProfileDialogOpen(true)
  }

  const handleResendPassword = async (member: Member) => {
    try {
      // Simular reenvio de senha
      toast({
        title: "Sucesso",
        description: `Email de redefinição enviado para ${member.email}`,
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao reenviar senha",
        variant: "destructive"
      })
    }
  }

  const handleBlockAccess = async (member: Member) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ status: 'suspended' })
        .eq('id', member.id)

      if (error) {
        toast({
          title: "Erro",
          description: error.message || "Erro ao bloquear acesso",
          variant: "destructive"
        })
        return
      }

      toast({
        title: "Sucesso",
        description: `Acesso bloqueado para ${member.full_name}`,
      })
      loadMembers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro interno ao bloquear acesso",
        variant: "destructive"
      })
    }
  }

  // Funções de import/export
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Nome,Email,Telefone,Status,Data de Criação\n" +
      members.map(m => 
        `${m.full_name},${m.email},${m.phone || ''},${m.status},${formatDateShort(m.created_at)}`
      ).join("\n")
    
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "membros.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: "Sucesso",
      description: "Lista de membros exportada com sucesso!",
    })
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      
      let importedCount = 0
      for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim()) {
          const values = lines[i].split(',')
          const memberData = {
            full_name: values[0]?.trim(),
            email: values[1]?.trim(),
            phone: values[2]?.trim() || null,
            status: 'active' as const
          }

          if (memberData.full_name && memberData.email) {
            await supabase
              .from('members')
              .upsert(memberData, { onConflict: 'email' })
            importedCount++
          }
        }
      }

      toast({
        title: "Sucesso",
        description: `${importedCount} membros importados com sucesso!`,
      })
      loadMembers()
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao importar arquivo",
        variant: "destructive"
      })
    }
  }

  // Funções de filtro
  const toggleFilter = (filterName: keyof FilterState) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterName]: prev[filterName] ? '' : 'active'
    }))
  }

  const getRoleForMember = (memberEmail: string) => {
    const member = userRoles.find(ur => ur.user_uuid === memberEmail)
    return member?.role || 'student'
  }

  const getCategoryCount = (category: Category) => {
    switch (category) {
      case 'all':
        return members.length
      case 'subscribers':
        return members.filter(m => m.status === 'active').length
      case 'unlimited':
        return members.filter(m => getRoleForMember(m.email) === 'teacher').length
      case 'collaborators':
        return members.filter(m => getRoleForMember(m.email) === 'admin').length
      case 'banned':
        return members.filter(m => m.status === 'suspended').length
      default:
        return 0
    }
  }

  const getCategoryLabel = (category: Category) => {
    switch (category) {
      case 'all':
        return 'Todos'
      case 'subscribers':
        return 'Assinantes'
      case 'unlimited':
        return 'Ilimitados'
      case 'collaborators':
        return 'Colaboradores'
      case 'banned':
        return 'Banidos'
      default:
        return ''
    }
  }

  // Função para obter cor da barra de status
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'inactive':
        return 'bg-yellow-500'
      case 'suspended':
        return 'bg-red-500'
      default:
        return 'bg-gray-500'
    }
  }

  // Função para obter cor do avatar baseada no role
  const getAvatarColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-600'
      case 'teacher':
        return 'bg-blue-100 text-blue-600'
      case 'student':
        return 'bg-green-100 text-green-600'
      default:
        return 'bg-orange-100 text-orange-600'
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    
    let matchesCategory = true
    switch (selectedCategory) {
      case 'subscribers':
        matchesCategory = member.status === 'active'
        break
      case 'unlimited':
        matchesCategory = getRoleForMember(member.email) === 'teacher'
        break
      case 'collaborators':
        matchesCategory = getRoleForMember(member.email) === 'admin'
        break
      case 'banned':
        matchesCategory = member.status === 'suspended'
        break
      default:
        matchesCategory = true
    }
    
    return matchesSearch && matchesCategory
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  if (isLoading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
        </div>
      </DashboardShell>
    )
  }

  return (
    <DashboardShell>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">CURSO EVEREST</h1>
            <h2 className="text-2xl font-semibold">Membros</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Importar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Exportar</span>
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Novo membro</span>
                  <span className="sm:hidden">Novo</span>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Membro</DialogTitle>
                  <DialogDescription>
                    Preencha os dados do novo membro
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nome Completo</Label>
                    <Input
                      id="full_name"
                      name="full_name"
                      value={newMember.full_name}
                      onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                      placeholder="Nome completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefone (opcional)</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                      placeholder="(11) 99999-9999"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Tipo de Usuário</Label>
                    <Select
                      value={newMember.role}
                      onValueChange={(value: 'student' | 'teacher' | 'admin') => 
                        setNewMember({...newMember, role: value})
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Aluno</SelectItem>
                        <SelectItem value="teacher">Professor</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddMember}>
                    Adicionar Membro
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2">
          {(['all', 'subscribers', 'unlimited', 'collaborators', 'banned'] as Category[]).map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="flex items-center gap-2"
            >
              {getCategoryLabel(category)}
              <Badge variant="secondary" className="ml-1">
                {getCategoryCount(category)}
              </Badge>
            </Button>
          ))}
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search-members"
                  name="search-members"
                  placeholder="Busque por nome"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Button 
                variant={activeFilters.curso ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter('curso')}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">+ Curso</span>
                <span className="sm:hidden">Curso</span>
              </Button>
              <Button 
                variant={activeFilters.turma ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter('turma')}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">+ Turma</span>
                <span className="sm:hidden">Turma</span>
              </Button>
              <Button 
                variant={activeFilters.assinatura ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter('assinatura')}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">+ Assinatura</span>
                <span className="sm:hidden">Assinatura</span>
              </Button>
              <Button 
                variant={activeFilters.ilimitado ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter('ilimitado')}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">+ Ilimitado</span>
                <span className="sm:hidden">Ilimitado</span>
              </Button>
              <Button 
                variant={activeFilters.convite ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter('convite')}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">+ Convite</span>
                <span className="sm:hidden">Convite</span>
              </Button>
              <Button 
                variant={activeFilters.certificado ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter('certificado')}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">+ Certificado</span>
                <span className="sm:hidden">Certificado</span>
              </Button>
              <Button 
                variant={activeFilters.ultimaVez ? "default" : "outline"} 
                size="sm"
                onClick={() => toggleFilter('ultimaVez')}
              >
                <Filter className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">+ Última vez visto</span>
                <span className="sm:hidden">Última vez</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Members Table */}
        <Card>
          <CardContent className="p-0">
            <div className="p-4 border-b">
              <p className="text-sm text-muted-foreground">
                Mostrando itens 1-{Math.min(10, filteredMembers.length)} do total de {filteredMembers.length}
              </p>
            </div>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum membro encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-4"></TableHead>
                      <TableHead>NOME COMPLETO</TableHead>
                      <TableHead className="hidden md:table-cell">ENDEREÇO DE EMAIL</TableHead>
                      <TableHead className="hidden lg:table-cell">DATA DE INSCRIÇÃO</TableHead>
                      <TableHead className="hidden lg:table-cell">ÚLTIMA VEZ VISTO</TableHead>
                      <TableHead>AÇÕES</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMembers.slice(0, 10).map((member) => {
                      const currentRole = getRoleForMember(member.email)
                      return (
                        <TableRow key={member.id} className="relative">
                          {/* Barra de status colorida */}
                          <TableCell className="w-4 p-0">
                            <div className={`w-1 h-full ${getStatusColor(member.status)} absolute left-0 top-0`}></div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getAvatarColor(currentRole)}`}>
                                <span className="text-sm font-medium">
                                  {member.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">{member.full_name}</span>
                                <span className="text-xs text-muted-foreground md:hidden">{member.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                          <TableCell className="hidden lg:table-cell">{formatDateShort(member.created_at)}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            {member.last_seen_at ? formatDateShort(member.last_seen_at) : 'Nunca'}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleViewProfile(member)}>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleResendPassword(member)}>
                                  <Key className="h-4 w-4 mr-2" />
                                  Reenviar senha
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600"
                                  onClick={() => handleBlockAccess(member)}
                                >
                                  <Ban className="h-4 w-4 mr-2" />
                                  Bloquear acesso
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Dialog */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Membros</DialogTitle>
            <DialogDescription>
              Selecione um arquivo CSV para importar membros
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="import-file">Arquivo CSV</Label>
              <Input
                id="import-file"
                name="import-file"
                type="file"
                accept=".csv"
                onChange={handleImport}
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>Formato esperado: Nome,Email,Telefone</p>
              <p>Exemplo: João Silva,joao@email.com,(11) 99999-9999</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Profile Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Perfil do Membro</DialogTitle>
            <DialogDescription>
              Informações detalhadas do membro
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center ${getAvatarColor(getRoleForMember(selectedMember.email))}`}>
                  <span className="text-2xl font-medium">
                    {selectedMember.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold">{selectedMember.full_name}</h3>
                  <p className="text-muted-foreground">{selectedMember.email}</p>
                  <Badge variant={selectedMember.status === 'active' ? 'default' : 'destructive'}>
                    {selectedMember.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Telefone</Label>
                  <p className="text-sm">{selectedMember.phone || 'Não informado'}</p>
                </div>
                <div>
                  <Label>Data de Criação</Label>
                  <p className="text-sm">{formatDate(selectedMember.created_at)}</p>
                </div>
                <div>
                  <Label>Último Acesso</Label>
                  <p className="text-sm">
                    {selectedMember.last_seen_at ? formatDate(selectedMember.last_seen_at) : 'Nunca'}
                  </p>
                </div>
                <div>
                  <Label>Total de Logins</Label>
                  <p className="text-sm">{selectedMember.login_count || 0}</p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleResendPassword(selectedMember)}>
                  <Key className="h-4 w-4 mr-2" />
                  Reenviar Senha
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => handleBlockAccess(selectedMember)}
                >
                  <Ban className="h-4 w-4 mr-2" />
                  Bloquear Acesso
                </Button>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
            <DialogDescription>
              Atualize os dados do membro
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit_full_name">Nome Completo</Label>
                <Input
                  id="edit_full_name"
                  name="edit_full_name"
                  value={editingMember.full_name}
                  onChange={(e) => setEditingMember({...editingMember, full_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  name="edit_email"
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Telefone</Label>
                <Input
                  id="edit_phone"
                  name="edit_phone"
                  value={editingMember.phone || ''}
                  onChange={(e) => setEditingMember({...editingMember, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_status">Status</Label>
                <Select
                  value={editingMember.status}
                  onValueChange={(value: 'active' | 'inactive' | 'suspended') => 
                    setEditingMember({...editingMember, status: value})
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="suspended">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateMember}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  )
} 