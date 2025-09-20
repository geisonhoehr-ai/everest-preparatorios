import { User } from './auth-custom'

// Tipos de usuário
export type UserRole = 'student' | 'teacher' | 'administrator'

// Permissões disponíveis no sistema
export enum Permission {
  // Dashboard e navegação básica
  VIEW_DASHBOARD = 'view_dashboard',
  
  // Conteúdo educacional
  VIEW_COURSES = 'view_courses',
  CREATE_COURSES = 'create_courses',
  EDIT_COURSES = 'edit_courses',
  DELETE_COURSES = 'delete_courses',
  
  VIEW_FLASHCARDS = 'view_flashcards',
  CREATE_FLASHCARDS = 'create_flashcards',
  EDIT_FLASHCARDS = 'edit_flashcards',
  DELETE_FLASHCARDS = 'delete_flashcards',
  
  VIEW_QUIZZES = 'view_quizzes',
  CREATE_QUIZZES = 'create_quizzes',
  EDIT_QUIZZES = 'edit_quizzes',
  DELETE_QUIZZES = 'delete_quizzes',
  TAKE_QUIZZES = 'take_quizzes',
  
  // Turmas e gestão
  VIEW_CLASSES = 'view_classes',
  CREATE_CLASSES = 'create_classes',
  EDIT_CLASSES = 'edit_classes',
  DELETE_CLASSES = 'delete_classes',
  MANAGE_CLASS_MEMBERS = 'manage_class_members',
  
  // Usuários
  VIEW_USERS = 'view_users',
  CREATE_USERS = 'create_users',
  EDIT_USERS = 'edit_users',
  DELETE_USERS = 'delete_users',
  DEACTIVATE_USERS = 'deactivate_users',
  
  // Rankings e progresso
  VIEW_RANKINGS = 'view_rankings',
  VIEW_PROGRESS = 'view_progress',
  MANAGE_PROGRESS = 'manage_progress',
  
  // Sistema
  VIEW_LOGS = 'view_logs',
  MANAGE_SYSTEM_SETTINGS = 'manage_system_settings',
  
  // Comunidade e suporte
  VIEW_COMMUNITY = 'view_community',
  MANAGE_SUPPORT = 'manage_support',
  
  // Calendário
  VIEW_CALENDAR = 'view_calendar',
  MANAGE_CALENDAR = 'manage_calendar',
  
  // Configurações pessoais
  EDIT_PROFILE = 'edit_profile',
  CHANGE_PASSWORD = 'change_password'
}

// Mapeamento de permissões por role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  student: [
    // Dashboard e navegação
    Permission.VIEW_DASHBOARD,
    
    // Conteúdo educacional (apenas visualização e uso)
    Permission.VIEW_COURSES,
    Permission.VIEW_FLASHCARDS,
    Permission.VIEW_QUIZZES,
    Permission.TAKE_QUIZZES,
    
    // Turmas (apenas as que está matriculado)
    Permission.VIEW_CLASSES,
    
    // Rankings e progresso (próprio)
    Permission.VIEW_RANKINGS,
    Permission.VIEW_PROGRESS,
    
    // Comunidade
    Permission.VIEW_COMMUNITY,
    
    // Calendário
    Permission.VIEW_CALENDAR,
    
    // Configurações pessoais
    Permission.EDIT_PROFILE,
    Permission.CHANGE_PASSWORD
  ],
  
  teacher: [
    // Dashboard e navegação
    Permission.VIEW_DASHBOARD,
    
    // Conteúdo educacional (criação e edição)
    Permission.VIEW_COURSES,
    Permission.CREATE_COURSES,
    Permission.EDIT_COURSES,
    Permission.DELETE_COURSES,
    
    Permission.VIEW_FLASHCARDS,
    Permission.CREATE_FLASHCARDS,
    Permission.EDIT_FLASHCARDS,
    Permission.DELETE_FLASHCARDS,
    
    Permission.VIEW_QUIZZES,
    Permission.CREATE_QUIZZES,
    Permission.EDIT_QUIZZES,
    Permission.DELETE_QUIZZES,
    Permission.TAKE_QUIZZES,
    
    // Turmas (gerenciar suas próprias)
    Permission.VIEW_CLASSES,
    Permission.CREATE_CLASSES,
    Permission.EDIT_CLASSES,
    Permission.DELETE_CLASSES,
    Permission.MANAGE_CLASS_MEMBERS,
    
    // Usuários (apenas alunos das suas turmas)
    Permission.VIEW_USERS,
    Permission.EDIT_USERS,
    
    // Rankings e progresso
    Permission.VIEW_RANKINGS,
    Permission.VIEW_PROGRESS,
    Permission.MANAGE_PROGRESS,
    
    // Comunidade e suporte
    Permission.VIEW_COMMUNITY,
    Permission.MANAGE_SUPPORT,
    
    // Calendário
    Permission.VIEW_CALENDAR,
    Permission.MANAGE_CALENDAR,
    
    // Configurações pessoais
    Permission.EDIT_PROFILE,
    Permission.CHANGE_PASSWORD
  ],
  
  administrator: [
    // Todas as permissões
    ...Object.values(Permission)
  ]
}

// Função para verificar se um usuário tem uma permissão específica
export function hasPermission(userRole: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[userRole].includes(permission)
}

// Função para verificar se um usuário tem qualquer uma das permissões
export function hasAnyPermission(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(userRole, permission))
}

// Função para verificar se um usuário tem todas as permissões
export function hasAllPermissions(userRole: UserRole, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(userRole, permission))
}

// Função para obter todas as permissões de um role
export function getPermissions(userRole: UserRole): Permission[] {
  return ROLE_PERMISSIONS[userRole]
}

// Função para verificar se um usuário pode acessar uma página específica
export function canAccessPage(userRole: UserRole, page: string): boolean {
  const pagePermissions: Record<string, Permission[]> = {
    dashboard: [Permission.VIEW_DASHBOARD],
    flashcards: [Permission.VIEW_FLASHCARDS],
    quiz: [Permission.VIEW_QUIZZES, Permission.TAKE_QUIZZES],
    ranking: [Permission.VIEW_RANKINGS],
    turmas: [Permission.VIEW_CLASSES],
    calendario: [Permission.VIEW_CALENDAR],
    community: [Permission.VIEW_COMMUNITY],
    settings: [Permission.EDIT_PROFILE],
    
    // Páginas específicas de professor/admin
    membros: [Permission.MANAGE_CLASS_MEMBERS],
    suporte: [Permission.MANAGE_SUPPORT],
    redacao: [Permission.CREATE_QUIZZES], // Assumindo que redação são quizzes especiais
    provas: [Permission.CREATE_QUIZZES],
    livros: [Permission.CREATE_FLASHCARDS], // Assumindo que livros são flashcards especiais
    
    // Páginas de admin
    admin: [Permission.MANAGE_SYSTEM_SETTINGS],
    usuarios: [Permission.VIEW_USERS, Permission.CREATE_USERS],
    logs: [Permission.VIEW_LOGS]
  }
  
  const requiredPermissions = pagePermissions[page]
  if (!requiredPermissions) {
    // Se a página não está mapeada, permitir acesso (pode ser uma página pública)
    return true
  }
  
  return hasAnyPermission(userRole, requiredPermissions)
}

// Função para filtrar itens do menu baseado no role do usuário
export function getMenuItemsForRole(userRole: UserRole) {
  const allMenuItems = [
    { title: "Dashboard", url: "/dashboard", permission: Permission.VIEW_DASHBOARD },
    { title: "Cursos", url: "/cursos", permission: Permission.VIEW_COURSES },
    { title: "Flashcards", url: "/flashcards", permission: Permission.VIEW_FLASHCARDS },
    { title: "Quiz", url: "/quiz", permission: Permission.VIEW_QUIZZES },
    { title: "Ranking", url: "/ranking", permission: Permission.VIEW_RANKINGS },
    { title: "Turmas", url: "/turmas", permission: Permission.VIEW_CLASSES },
    { title: "Calendário", url: "/calendario", permission: Permission.VIEW_CALENDAR },
    { title: "Comunidade", url: "/community", permission: Permission.VIEW_COMMUNITY },
    { title: "Configurações", url: "/settings", permission: Permission.EDIT_PROFILE },
    
    // Páginas específicas de professor/admin
    { title: "Membros", url: "/membros", permission: Permission.MANAGE_CLASS_MEMBERS },
    { title: "Suporte", url: "/suporte", permission: Permission.MANAGE_SUPPORT },
    { title: "Redação", url: "/redacao", permission: Permission.CREATE_QUIZZES },
    { title: "Provas", url: "/provas", permission: Permission.CREATE_QUIZZES },
    { title: "Livros", url: "/livros", permission: Permission.CREATE_FLASHCARDS },
    
    // Páginas de admin
    { title: "Administração", url: "/admin", permission: Permission.MANAGE_SYSTEM_SETTINGS }
  ]
  
  return allMenuItems.filter(item => hasPermission(userRole, item.permission))
}

// Hook para verificar permissões no frontend
export function usePermissions(user: User | null) {
  if (!user) {
    return {
      hasPermission: () => false,
      hasAnyPermission: () => false,
      hasAllPermissions: () => false,
      canAccessPage: () => false,
      getMenuItems: () => []
    }
  }
  
  return {
    hasPermission: (permission: Permission) => hasPermission(user.role, permission),
    hasAnyPermission: (permissions: Permission[]) => hasAnyPermission(user.role, permissions),
    hasAllPermissions: (permissions: Permission[]) => hasAllPermissions(user.role, permissions),
    canAccessPage: (page: string) => canAccessPage(user.role, page),
    getMenuItems: () => getMenuItemsForRole(user.role)
  }
}
