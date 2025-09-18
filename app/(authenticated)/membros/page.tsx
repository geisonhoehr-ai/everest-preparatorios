'use client'

import { useState, useEffect } from 'react'
import { useAuth } from "@/context/auth-context"
import { 
  getAllMembers, 
  getAllClasses, 
  getAllAccessPlans, 
  createMember, 
  updateMember, 
  deleteMember, 
  createTemporaryPassword, 
  getMemberPagePermissions 
} from "../../server-actions"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Key, 
  Search, 
  Filter,
  Calendar,
  Clock,
  Mail,
  User,
  Shield,
  Eye,
  EyeOff,
  Loader2
} from "lucide-react"
import { toast } from 'sonner'
import { Checkbox } from "@/components/ui/checkbox"

interface Member {
  user_id: string
  name: string
  email: string
  class_id?: string
  access_expires_at?: string
  must_change_password: boolean
  created_at: string
  classes?: { name: string }
  student_subscriptions?: Array<{
    access_plans: { name: string; duration_months: number; features: any }
    classes: { name: string }
    start_date: string
    end_date: string
    is_active: boolean
  }>
}

interface Class {
  id: string
  name: string
  description?: string
  max_students: number
}

interface AccessPlan {
  id: string
  name: string
  description?: string
  duration_months: number
  price: number
  features: any
}

export default function MembrosPage() {
  const { user, profile } = useAuth()
  const [members, setMembers] = useState<Member[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [accessPlans, setAccessPlans] = useState<AccessPlan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [showTemporaryPassword, setShowTemporaryPassword] = useState(false)
  const [temporaryPassword, setTemporaryPassword] = useState('')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class_id: '',
    access_plan_id: '',
    start_date: '',
    end_date: '',
    page_permissions: {
      quiz: false,
      flashcards: false,
      evercast: false,
      calendario: false
    }
  })

  // Verificar se o usuário tem permissão
  const canManage = profile?.role === 'administrator' || profile?.role === 'teacher'

  useEffect(() => {
    if (canManage) {
      loadData()
    }
  }, [canManage])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [membersData, classesData, accessPlansData] = await Promise.all([
        getAllMembers(),
        getAllClasses(),
        getAllAccessPlans()
      ])
      
      setMembers(membersData)
      setClasses(classesData)
      setAccessPlans(accessPlansData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      toast.error('Erro ao carregar dados')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateMember = async () => {
    try {
      if (!user?.id) return

      const result = await createMember(formData, user.id)
      
      if (result.success) {
        toast.success(result.message)
        setShowCreateModal(false)
        setTemporaryPassword(result.temporaryPassword || '')
        setShowTemporaryPassword(true)
        resetForm()
        loadData()
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar membro')
    }
  }

  const handleUpdateMember = async () => {
    try {
      if (!user?.id || !editingMember) return

      const result = await updateMember(editingMember.user_id, formData, user.id)
      
      if (result.success) {
        toast.success(result.message)
        setShowEditModal(false)
        setEditingMember(null)
        resetForm()
        loadData()
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar membro')
    }
  }

  const handleDeleteMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Tem certeza que deseja deletar o membro "${memberName}"? Esta ação não pode ser desfeita.`)) {
      return
    }

    try {
      if (!user?.id) return

      const result = await deleteMember(memberId, user.id)
      
      if (result.success) {
        toast.success(result.message)
        loadData()
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao deletar membro')
    }
  }

  const handleCreateTemporaryPassword = async (memberId: string) => {
    try {
      if (!user?.id) return

      const result = await createTemporaryPassword(memberId, user.id)
      
      if (result.success) {
        setTemporaryPassword(result.temporaryPassword || '')
        setShowTemporaryPassword(true)
        toast.success('Senha provisória criada com sucesso!')
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar senha provisória')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      class_id: '',
      access_plan_id: '',
      start_date: '',
      end_date: '',
      page_permissions: {
        quiz: false,
        flashcards: false,
        evercast: false,
        calendario: false
      }
    })
  }

  const openEditModal = async (member: Member) => {
    setEditingMember(member)
    
    // Carregar permissões do membro
    try {
      const permissions = await getMemberPagePermissions(member.user_id)
      
      setFormData({
        name: member.name,
        email: member.email,
        class_id: member.class_id || '',
        access_plan_id: '',
        start_date: member.student_subscriptions?.[0]?.start_date || '',
        end_date: member.student_subscriptions?.[0]?.end_date || '',
        page_permissions: {
          quiz: permissions.quiz || false,
          flashcards: permissions.flashcards || false,
          evercast: permissions.evercast || false,
          calendario: permissions.calendario || false
        }
      })
    } catch (error) {
      console.error('Erro ao carregar permissões:', error)
    }
    
    setShowEditModal(true)
  }

  const updatePagePermission = (page: string, hasAccess: boolean) => {
    setFormData(prev => ({
      ...prev,
      page_permissions: {
        ...prev.page_permissions,
        [page]: hasAccess
      }
    }))
  }

  const updateAccessPlan = (planId: string) => {
    const plan = accessPlans.find(p => p.id === planId)
    if (plan) {
      setFormData(prev => ({
        ...prev,
        access_plan_id: planId,
        page_permissions: plan.features || prev.page_permissions
      }))
    }
  }

  // Filtrar membros
  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === 'all' || member.class_id === selectedClass
    return matchesSearch && matchesClass
  })

  if (!canManage) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Acesso Negado
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Apenas professores e administradores podem gerenciar membros.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestão de Membros
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gerencie alunos, turmas e permissões de acesso
            </p>
          </div>
        </div>
        
        <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Membro
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Membro</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do aluno"
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@exemplo.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="class">Turma</Label>
                  <Select value={formData.class_id} onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma turma" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Sem turma</SelectItem>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>
                          {cls.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="access_plan">Plano de Acesso</Label>
                  <Select value={formData.access_plan_id} onValueChange={updateAccessPlan}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um plano" />
                    </SelectTrigger>
                    <SelectContent>
                      {accessPlans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - {plan.duration_months} meses
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Data de Início</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Data de Expiração</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Permissões de Acesso</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="quiz"
                      checked={formData.page_permissions.quiz}
                      onCheckedChange={(checked) => updatePagePermission('quiz', checked as boolean)}
                    />
                    <Label htmlFor="quiz">Quiz</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="flashcards"
                      checked={formData.page_permissions.flashcards}
                      onCheckedChange={(checked) => updatePagePermission('flashcards', checked as boolean)}
                    />
                    <Label htmlFor="flashcards">Flashcards</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="evercast"
                      checked={formData.page_permissions.evercast}
                      onCheckedChange={(checked) => updatePagePermission('evercast', checked as boolean)}
                    />
                    <Label htmlFor="evercast">Evercast</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="calendario"
                      checked={formData.page_permissions.calendario}
                      onCheckedChange={(checked) => updatePagePermission('calendario', checked as boolean)}
                    />
                    <Label htmlFor="calendario">Calendário</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateMember}>
                  Criar Membro
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por turma" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as turmas</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Membros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Membros ({filteredMembers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Turma</TableHead>
                    <TableHead>Plano</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMembers.map((member) => (
                    <TableRow key={member.user_id}>
                      <TableCell className="font-medium">{member.name}</TableCell>
                      <TableCell>{member.email}</TableCell>
                      <TableCell>
                        {member.classes?.name || 'Sem turma'}
                      </TableCell>
                      <TableCell>
                        {member.student_subscriptions?.[0]?.access_plans?.name || 'N/A'}
                      </TableCell>
                      <TableCell>
                        {member.access_expires_at ? 
                          new Date(member.access_expires_at).toLocaleDateString('pt-BR') : 
                          'N/A'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {member.must_change_password && (
                            <Badge variant="destructive" className="text-xs">
                              Trocar Senha
                            </Badge>
                          )}
                          {member.access_expires_at && new Date(member.access_expires_at) > new Date() ? (
                            <Badge variant="default" className="text-xs">
                              Ativo
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              Expirado
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditModal(member)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCreateTemporaryPassword(member.user_id)}
                          >
                            <Key className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteMember(member.user_id, member.name)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Edição */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Membro</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_name">Nome Completo</Label>
                <Input
                  id="edit_name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_email">E-mail</Label>
                <Input
                  id="edit_email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_class">Turma</Label>
                <Select value={formData.class_id} onValueChange={(value) => setFormData(prev => ({ ...prev, class_id: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma turma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem turma</SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit_access_plan">Plano de Acesso</Label>
                <Select value={formData.access_plan_id} onValueChange={updateAccessPlan}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um plano" />
                  </SelectTrigger>
                  <SelectContent>
                    {accessPlans.map((plan) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        {plan.name} - {plan.duration_months} meses
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit_start_date">Data de Início</Label>
                <Input
                  id="edit_start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit_end_date">Data de Expiração</Label>
                <Input
                  id="edit_end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Permissões de Acesso</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_quiz"
                    checked={formData.page_permissions.quiz}
                    onCheckedChange={(checked) => updatePagePermission('quiz', checked as boolean)}
                  />
                  <Label htmlFor="edit_quiz">Quiz</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_flashcards"
                    checked={formData.page_permissions.flashcards}
                    onCheckedChange={(checked) => updatePagePermission('flashcards', checked as boolean)}
                  />
                  <Label htmlFor="edit_flashcards">Flashcards</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_evercast"
                    checked={formData.page_permissions.evercast}
                    onCheckedChange={(checked) => updatePagePermission('evercast', checked as boolean)}
                  />
                  <Label htmlFor="edit_evercast">Evercast</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="edit_calendario"
                    checked={formData.page_permissions.calendario}
                    onCheckedChange={(checked) => updatePagePermission('calendario', checked as boolean)}
                  />
                  <Label htmlFor="edit_calendario">Calendário</Label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Cancelar
              </Button>
              <Button onClick={handleUpdateMember}>
                Salvar Alterações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Senha Provisória */}
      <Dialog open={showTemporaryPassword} onOpenChange={setShowTemporaryPassword}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha Provisória Criada</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <Label className="text-sm font-medium">Senha Provisória:</Label>
              <div className="flex items-center gap-2 mt-2">
                <Input
                  value={temporaryPassword}
                  readOnly
                  className="font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigator.clipboard.writeText(temporaryPassword)}
                >
                  Copiar
                </Button>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p>⚠️ <strong>Importante:</strong></p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Esta senha expira em 7 dias</li>
                <li>O usuário será obrigado a trocar a senha no primeiro login</li>
                <li>Compartilhe esta senha de forma segura com o aluno</li>
              </ul>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setShowTemporaryPassword(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}