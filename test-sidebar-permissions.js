// Teste das permissões do sidebar baseado no role
const ROLE_PERMISSIONS = {
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
};

const navigationItems = [
  { title: "Dashboard", href: "/dashboard", icon: "BarChart3", access: "all" },
  { title: "Quiz", href: "/quiz", icon: "Brain", access: "all" },
  { title: "Flashcards", href: "/flashcards", icon: "BookOpen", access: "all" },
  { title: "Ranking", href: "/ranking", icon: "Trophy", access: "all" },
  { title: "Calendário", href: "/calendario", icon: "Calendar", access: "all" },
  { title: "Suporte", href: "/suporte", icon: "Monitor", access: "all" },
  { title: "Configurações", href: "/settings", icon: "Settings", access: "all" },
  { title: "Redação", href: "/redacao", icon: "FileText", access: "teacher" },
  { title: "Provas", href: "/provas", icon: "ClipboardList", access: "teacher" },
  { title: "Comunidade", href: "/community", icon: "MessageSquare", access: "teacher" },
  { title: "Livros", href: "/livros", icon: "BookOpen", access: "teacher" },
  { title: "Turmas", href: "/turmas", icon: "Users", access: "teacher" },
  { title: "Membros", href: "/membros", icon: "Users", access: "admin" },
];

function filterNavigationItems(userRole) {
  return navigationItems.filter(item => {
    if (item.access === "all") return true;
    if (item.access === "teacher" && (userRole === "teacher" || userRole === "admin")) return true;
    if (item.access === "admin" && userRole === "admin") return true;
    return false;
  });
}

console.log('🧪 Testando permissões do sidebar...\n');

// Testar cada role
const roles = ['student', 'teacher', 'admin'];

roles.forEach(role => {
  console.log(`👤 Role: ${role.toUpperCase()}`);
  const allowedItems = filterNavigationItems(role);
  console.log(`📋 Páginas permitidas (${allowedItems.length}):`);
  allowedItems.forEach(item => {
    console.log(`   ✅ ${item.title} (${item.href})`);
  });
  
  const blockedItems = navigationItems.filter(item => !allowedItems.includes(item));
  if (blockedItems.length > 0) {
    console.log(`🚫 Páginas bloqueadas (${blockedItems.length}):`);
    blockedItems.forEach(item => {
      console.log(`   ❌ ${item.title} (${item.href}) - Acesso: ${item.access}`);
    });
  }
  console.log('');
});

console.log('✅ Teste de permissões concluído!');
