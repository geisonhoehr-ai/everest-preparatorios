// Definição de permissões por role
export const ROLE_PERMISSIONS = {
  admin: [
    'dashboard',
    'quiz',
    'flashcards',
    'ranking',
    'calendario',
    'suporte',
    'settings',
    'membros',
    'turmas',
    'provas',
    'redacao',
    'livros',
    'community'
  ],
  teacher: [
    'dashboard',
    'quiz',
    'flashcards',
    'ranking',
    'calendario',
    'suporte',
    'settings',
    'turmas',
    'provas',
    'redacao',
    'livros',
    'community'
  ],
  student: [
    'dashboard',
    'quiz',
    'flashcards',
    'ranking',
    'calendario',
    'suporte',
    'settings'
  ]
} as const;

export type UserRole = keyof typeof ROLE_PERMISSIONS;

// Função para verificar se um usuário tem permissão para acessar uma página
export function hasPermission(userRole: UserRole, page: string): boolean {
  return ROLE_PERMISSIONS[userRole].includes(page as any);
}

// Função para obter páginas permitidas para um role
export function getAllowedPages(userRole: UserRole): string[] {
  return [...ROLE_PERMISSIONS[userRole]];
}
