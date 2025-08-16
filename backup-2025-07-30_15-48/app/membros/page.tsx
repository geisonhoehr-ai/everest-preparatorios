'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  getAllMembers, 
  createMember, 
  updateMember, 
  deleteMember,
  getMemberStats,
  importMembersFromCSV,
  importSubscriptionsFromCSV
} from '@/app/actions-members'
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download, 
  Upload,
  Users,
  UserCheck,
  UserX,
  Clock
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Member {
  id: number
  full_name: string
  email: string
  cpf_cnpj?: string
  phone?: string
  login_count: number
  current_login_at?: string
  last_seen_at?: string
  created_at: string
  status: 'active' | 'inactive' | 'suspended'
  subscriptions?: Subscription[]
}

interface Subscription {
  id: number
  course_name: string
  class_name: string
  progress: number
  status: 'active' | 'inactive' | 'expired'
  enrollment_date: string
  expiration_date?: string
}

export default function MembrosPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showImportDialog, setShowImportDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [csvData, setCsvData] = useState('')
  const { toast } = useToast()

  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    cpf_cnpj: '',
    phone: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [membersData, statsData] = await Promise.all([
        getAllMembers(),
        getMemberStats()
      ])
      setMembers(membersData)
      setStats(statsData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar dados dos membros',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateMember = async () => {
    try {
      const result = await createMember(formData)
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Membro criado com sucesso!'
        })
        setShowCreateDialog(false)
        setFormData({
          full_name: '',
          email: '',
          cpf_cnpj: '',
          phone: '',
          status: 'active'
        })
        loadData()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao criar membro',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      })
    }
  }

  const handleUpdateMember = async () => {
    if (!editingMember) return

    try {
      const result = await updateMember(editingMember.id, formData)
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Membro atualizado com sucesso!'
        })
        setEditingMember(null)
        setFormData({
          full_name: '',
          email: '',
          cpf_cnpj: '',
          phone: '',
          status: 'active'
        })
        loadData()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao atualizar membro',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteMember = async (id: number) => {
    if (!confirm('Tem certeza que deseja deletar este membro?')) return

    try {
      const result = await deleteMember(id)
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Membro deletado com sucesso!'
        })
        loadData()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao deletar membro',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      })
    }
  }

  const handleImportCSV = async () => {
    if (!csvData.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, cole os dados do CSV',
        variant: 'destructive'
      })
      return
    }

    try {
      const result = await importMembersFromCSV(csvData)
      if (result.success) {
        toast({
          title: 'Sucesso',
          description: `${result.data?.length || 0} membros importados com sucesso!`
        })
        setShowImportDialog(false)
        setCsvData('')
        loadData()
      } else {
        toast({
          title: 'Erro',
          description: result.error || 'Erro ao importar membros',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro interno do servidor',
        variant: 'destructive'
      })
    }
  }

  const handleEditMember = (member: Member) => {
    setEditingMember(member)
    setFormData({
      full_name: member.full_name,
      email: member.email,
      cpf_cnpj: member.cpf_cnpj || '',
      phone: member.phone || '',
      status: member.status
    })
  }

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500">Ativo</Badge>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Membros</h1>
          <p className="text-muted-foreground">Gerencie os membros da plataforma</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Importar CSV
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Importar Membros do CSV</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Dados do CSV</label>
                  <textarea
                    className="w-full h-64 p-3 border rounded-md"
                    placeholder="Cole aqui os dados do CSV..."
                    value={csvData}
                    onChange={(e) => setCsvData(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleImportCSV}>
                    Importar
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Novo Membro
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? 'Editar Membro' : 'Novo Membro'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nome Completo</label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@exemplo.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">CPF/CNPJ</label>
                  <Input
                    value={formData.cpf_cnpj}
                    onChange={(e) => setFormData({...formData, cpf_cnpj: e.target.value})}
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Telefone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="w-full p-2 border rounded-md"
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                    <option value="suspended">Suspenso</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => {
                    setShowCreateDialog(false)
                    setEditingMember(null)
                    setFormData({
                      full_name: '',
                      email: '',
                      cpf_cnpj: '',
                      phone: '',
                      status: 'active'
                    })
                  }}>
                    Cancelar
                  </Button>
                  <Button onClick={editingMember ? handleUpdateMember : handleCreateMember}>
                    {editingMember ? 'Atualizar' : 'Criar'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_members}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active_members}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inativos</CardTitle>
              <UserX className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive_members}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Suspensos</CardTitle>
              <Clock className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.suspended_members}</div>
            </CardContent>
          </Card>
        </div>
      )}

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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Logins</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.full_name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{getStatusBadge(member.status)}</TableCell>
                  <TableCell>{member.login_count}</TableCell>
                  <TableCell>
                    {member.last_seen_at ? formatDate(member.last_seen_at) : 'Nunca'}
                  </TableCell>
                  <TableCell>{formatDate(member.created_at)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditMember(member)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteMember(member.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 