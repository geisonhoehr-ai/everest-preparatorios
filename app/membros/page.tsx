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
  User
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
}

interface UserRole {
  user_uuid: string
  role: 'student' | 'teacher' | 'admin'
}

export default function MembrosPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [userRoles, setUserRoles] = useState<UserRole[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [newMember, setNewMember] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'student' as 'student' | 'teacher' | 'admin'
  })
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      setIsLoading(true)
      
      // Buscar membros
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (!membersError && membersData) {
        setMembers(membersData)
      }

      // Buscar roles dos usuários
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
      console.log('🔍 [MEMBROS] Iniciando adição de membro:', newMember)
      
      // Validar dados obrigatórios
      if (!newMember.full_name || !newMember.email) {
        toast({
          title: "Erro",
          description: "Nome e email são obrigatórios",
          variant: "destructive"
        })
        return
      }

      // Criar o membro diretamente usando o cliente Supabase
      console.log('📝 [MEMBROS] Inserindo membro no banco...')
      const memberDataToInsert = {
        full_name: newMember.full_name,
        email: newMember.email,
        phone: newMember.phone || null,
        status: 'active' as const
      }

      console.log('📊 [MEMBROS] Dados para inserção:', memberDataToInsert)

      const { data: memberData, error: insertError } = await supabase
        .from('members')
        .insert(memberDataToInsert)
        .select()
        .single()

      if (insertError) {
        console.error('❌ [MEMBROS] Erro ao inserir membro:', insertError)
        console.error('❌ [MEMBROS] Detalhes do erro:', {
          code: insertError.code,
          message: insertError.message,
          details: insertError.details,
          hint: insertError.hint
        })
        toast({
          title: "Erro",
          description: insertError.message || "Erro ao adicionar membro",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [MEMBROS] Membro criado com sucesso:', memberData)
      
      // Definir o role do usuário (temporariamente desabilitado)
      console.log('🔧 [MEMBROS] Definindo role:', newMember.role)
      try {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_uuid: newMember.email, // Usando email como user_uuid temporariamente
            role: newMember.role
          }, {
            onConflict: 'user_uuid'
          })

        if (roleError) {
          console.error('❌ [MEMBROS] Erro ao definir role:', roleError)
          // Não falhar se o role não puder ser definido
        } else {
          console.log('✅ [MEMBROS] Role definido com sucesso')
        }
      } catch (roleError) {
        console.error('❌ [MEMBROS] Erro ao definir role:', roleError)
        // Não falhar se o role não puder ser definido
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
      console.error('❌ [MEMBROS] Erro inesperado ao adicionar membro:', error)
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
      console.log('🔍 [MEMBROS] Atualizando membro:', editingMember)

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
        console.error('❌ [MEMBROS] Erro ao atualizar membro:', error)
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar membro",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [MEMBROS] Membro atualizado com sucesso:', data)
      toast({
        title: "Sucesso",
        description: "Membro atualizado com sucesso!",
      })

      setIsEditDialogOpen(false)
      setEditingMember(null)
      loadMembers()
    } catch (error) {
      console.error('❌ [MEMBROS] Erro inesperado ao atualizar membro:', error)
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
      console.log('🔍 [MEMBROS] Excluindo membro ID:', memberId)

      const { error } = await supabase
        .from('members')
        .delete()
        .eq('id', memberId)

      if (error) {
        console.error('❌ [MEMBROS] Erro ao excluir membro:', error)
        toast({
          title: "Erro",
          description: error.message || "Erro ao excluir membro",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [MEMBROS] Membro excluído com sucesso')
      toast({
        title: "Sucesso",
        description: "Membro excluído com sucesso!",
      })
      loadMembers()
    } catch (error) {
      console.error('❌ [MEMBROS] Erro inesperado ao excluir membro:', error)
      toast({
        title: "Erro",
        description: "Erro interno ao excluir membro",
        variant: "destructive"
      })
    }
  }

  const handleUpdateRole = async (memberId: number, newRole: 'student' | 'teacher' | 'admin') => {
    try {
      // Buscar o membro pelo ID
      const member = members.find(m => m.id === memberId)
      if (!member) return

      console.log('🔧 [MEMBROS] Atualizando role para:', member.email, '->', newRole)

      // Atualizar o role diretamente usando o cliente Supabase
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_uuid: member.email, // Usando email como user_uuid
          role: newRole
        }, {
          onConflict: 'user_uuid'
        })
      
      if (error) {
        console.error('❌ [MEMBROS] Erro ao atualizar role:', error)
        toast({
          title: "Erro",
          description: error.message || "Erro ao atualizar role",
          variant: "destructive"
        })
        return
      }

      console.log('✅ [MEMBROS] Role atualizado com sucesso')
      toast({
        title: "Sucesso",
        description: `Role atualizado para ${newRole}!`,
      })
      
      loadMembers()
    } catch (error) {
      console.error('❌ [MEMBROS] Erro inesperado ao atualizar role:', error)
      toast({
        title: "Erro",
        description: "Erro interno ao atualizar role",
        variant: "destructive"
      })
    }
  }

  const getRoleForMember = (memberEmail: string) => {
    const member = userRoles.find(ur => ur.user_uuid === memberEmail)
    return member?.role || 'student'
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />
      case 'teacher':
        return <GraduationCap className="h-4 w-4 text-blue-500" />
      case 'student':
        return <User className="h-4 w-4 text-green-500" />
      default:
        return <User className="h-4 w-4 text-gray-500" />
    }
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-500">Admin</Badge>
      case 'teacher':
        return <Badge className="bg-blue-500">Professor</Badge>
      case 'student':
        return <Badge className="bg-green-500">Aluno</Badge>
      default:
        return <Badge variant="outline">Aluno</Badge>
    }
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || member.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Ativo</Badge>
      case 'inactive':
        return <Badge variant="secondary">Inativo</Badge>
      case 'suspended':
        return <Badge variant="destructive">Suspenso</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const stats = {
    total: members.length,
    active: members.filter(m => m.status === 'active').length,
    inactive: members.filter(m => m.status === 'inactive').length,
    suspended: members.filter(m => m.status === 'suspended').length
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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Membros</h1>
            <p className="text-muted-foreground">Gerencie os membros da plataforma</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Novo Membro
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
                    value={newMember.full_name}
                    onChange={(e) => setNewMember({...newMember, full_name: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspensos</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.suspended}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <select
            className="px-3 py-2 border rounded-md"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativos</option>
            <option value="inactive">Inativos</option>
            <option value="suspended">Suspensos</option>
          </select>
        </div>

        {/* Members Table */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Membros ({filteredMembers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum membro encontrado</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefone</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Logins</TableHead>
                    <TableHead>Último Acesso</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => {
                    const currentRole = getRoleForMember(member.email)
                    return (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">{member.full_name}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            {member.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          {member.phone ? (
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              {member.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getRoleIcon(currentRole)}
                            {getRoleBadge(currentRole)}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(member.status)}</TableCell>
                        <TableCell>{member.login_count || 0}</TableCell>
                        <TableCell>
                          {member.last_seen_at ? (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              {formatDate(member.last_seen_at)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Nunca</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(member.created_at)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={currentRole}
                              onValueChange={(value: 'student' | 'teacher' | 'admin') => 
                                handleUpdateRole(member.id, value)
                              }
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="student">Aluno</SelectItem>
                                <SelectItem value="teacher">Professor</SelectItem>
                                <SelectItem value="admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingMember(member)
                                setIsEditDialogOpen(true)
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteMember(member.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

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
                  value={editingMember.full_name}
                  onChange={(e) => setEditingMember({...editingMember, full_name: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_email">Email</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={editingMember.email}
                  onChange={(e) => setEditingMember({...editingMember, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit_phone">Telefone</Label>
                <Input
                  id="edit_phone"
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