# 📚 Everest Preparatórios - Documentação Completa do Projeto

## 🎯 Visão Geral

O **Everest Preparatórios** é uma plataforma educacional completa desenvolvida em Next.js 15 com TypeScript, focada em preparação para concursos militares. A plataforma oferece um sistema robusto de estudos com flashcards, quizzes, cursos de áudio (EverCast), calendário de eventos e sistema de ranking.

## 🏗️ Arquitetura do Sistema

### Stack Tecnológico
- **Frontend**: Next.js 15, React 18, TypeScript
- **Backend**: Next.js API Routes, Supabase
- **Banco de Dados**: PostgreSQL (via Supabase)
- **Autenticação**: Sistema customizado com Supabase Auth
- **UI/UX**: Tailwind CSS, Radix UI, Lucide Icons
- **Audio**: HLS.js, Service Workers para PWA
- **Deploy**: Vercel (recomendado)

### Estrutura de Pastas
```
everest-preparatorios/
├── app/                          # App Router (Next.js 15)
│   ├── (authenticated)/          # Páginas protegidas
│   │   ├── admin/               # Painel administrativo
│   │   ├── calendario/          # Calendário de eventos
│   │   ├── dashboard/           # Dashboard principal
│   │   ├── evercast/            # Cursos de áudio
│   │   ├── flashcards/          # Sistema de flashcards
│   │   ├── membros/             # Gestão de membros
│   │   ├── quiz/                # Sistema de quizzes
│   │   ├── ranking/             # Ranking de usuários
│   │   └── layout.tsx           # Layout das páginas autenticadas
│   ├── api/                     # API Routes
│   ├── login/                   # Página de login
│   ├── page.tsx                 # Home pública
│   └── layout.tsx               # Layout raiz
├── components/                   # Componentes reutilizáveis
├── lib/                         # Utilitários e configurações
├── context/                     # Contextos React
├── actions/                     # Server Actions
└── types/                       # Definições de tipos
```

## 🗄️ Banco de Dados (Supabase)

### Tabelas Principais

#### 1. **users** - Usuários do Sistema
```sql
- id (uuid, PK)
- email (varchar, unique)
- password_hash (varchar)
- first_name (varchar)
- last_name (varchar)
- role (enum: administrator, teacher, student)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
- last_login_at (timestamp)
```

#### 2. **subjects** - Matérias/Disciplinas
```sql
- id (serial, PK)
- name (varchar, unique)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 3. **topics** - Tópicos das Matérias
```sql
- id (varchar, PK) -- Ex: "regencia", "concordancia"
- subject_id (int, FK)
- name (varchar)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 4. **flashcards** - Cartões de Estudo
```sql
- id (serial, PK)
- topic_id (varchar, FK)
- question (text)
- answer (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 5. **quizzes** - Quizzes/Tests
```sql
- id (serial, PK)
- topic_id (varchar, FK)
- title (varchar)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 6. **quiz_questions** - Questões dos Quizzes
```sql
- id (serial, PK)
- quiz_id (int, FK)
- question_text (text)
- options (jsonb) -- Array de opções
- correct_answer (varchar)
- explanation (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 7. **audio_courses** - Cursos de Áudio (EverCast)
```sql
- id (serial, PK)
- name (varchar, unique)
- description (text)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 8. **audio_modules** - Módulos dos Cursos
```sql
- id (serial, PK)
- course_id (int, FK)
- name (varchar)
- description (text)
- order_index (int)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 9. **audio_lessons** - Aulas de Áudio
```sql
- id (serial, PK)
- module_id (int, FK)
- title (varchar)
- description (text)
- audio_url (varchar) -- URL do arquivo MP3
- hls_url (varchar) -- URL HLS para streaming
- soundcloud_url (varchar) -- URL do SoundCloud
- duration_seconds (int)
- order_index (int)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 10. **user_progress** - Progresso dos Usuários
```sql
- id (serial, PK)
- user_id (uuid, FK)
- topic_id (varchar, FK)
- total_xp (int, default: 0)
- flashcards_studied (int, default: 0)
- quizzes_completed (int, default: 0)
- correct_answers (int, default: 0)
- total_answers (int, default: 0)
- last_studied_at (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 11. **flashcard_progress** - Progresso dos Flashcards
```sql
- id (serial, PK)
- user_id (uuid, FK)
- flashcard_id (int, FK)
- difficulty_level (int) -- 1-5 (Spaced Repetition)
- next_review_at (timestamp)
- review_count (int, default: 0)
- correct_count (int, default: 0)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 12. **classes** - Turmas
```sql
- id (uuid, PK)
- name (varchar, unique)
- description (text)
- max_students (int)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 13. **students** - Dados dos Estudantes
```sql
- id (serial, PK)
- user_id (uuid, FK, unique)
- student_id_number (varchar, unique)
- enrollment_date (date)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 14. **teachers** - Dados dos Professores
```sql
- id (serial, PK)
- user_id (uuid, FK, unique)
- employee_id_number (varchar, unique)
- hire_date (date)
- department (varchar)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 15. **student_classes** - Relacionamento Estudante-Turma
```sql
- id (serial, PK)
- user_id (uuid, FK)
- class_id (uuid, FK)
- enrolled_at (timestamp)
- created_at (timestamp)
```

#### 16. **access_plans** - Planos de Acesso
```sql
- id (uuid, PK)
- name (varchar)
- description (text)
- duration_months (int)
- price (decimal)
- features (jsonb) -- Permissões incluídas
- created_at (timestamp)
- updated_at (timestamp)
```

#### 17. **student_subscriptions** - Assinaturas dos Estudantes
```sql
- id (uuid, PK)
- user_id (uuid, FK)
- access_plan_id (uuid, FK)
- class_id (uuid, FK)
- start_date (date)
- end_date (date)
- is_active (boolean)
- created_at (timestamp)
- updated_at (timestamp)
```

#### 18. **page_permissions** - Permissões de Página
```sql
- id (serial, PK)
- user_id (uuid, FK)
- page_name (varchar) -- 'quiz', 'flashcards', 'evercast', 'calendario'
- has_access (boolean)
- granted_at (timestamp)
- granted_by (uuid, FK)
- created_at (timestamp)
```

#### 19. **user_sessions** - Sessões de Usuário
```sql
- id (serial, PK)
- user_id (uuid, FK)
- session_token (varchar, unique)
- expires_at (timestamp)
- created_at (timestamp)
```

#### 20. **password_reset_tokens** - Tokens de Reset de Senha
```sql
- id (serial, PK)
- user_id (uuid, FK)
- token (varchar, unique)
- expires_at (timestamp)
- used_at (timestamp)
- created_at (timestamp)
```

#### 21. **rpg_ranks** - Sistema RPG de Níveis
```sql
- id (serial, PK)
- name (varchar, unique)
- min_xp (int, unique)
- max_xp (int, unique)
- description (text)
- created_at (timestamp)
```

### Relacionamentos Principais
- **users** → **students/teachers** (1:1)
- **subjects** → **topics** (1:N)
- **topics** → **flashcards/quizzes** (1:N)
- **quizzes** → **quiz_questions** (1:N)
- **audio_courses** → **audio_modules** → **audio_lessons** (1:N:N)
- **users** → **user_progress** (1:N)
- **users** → **flashcard_progress** (1:N)
- **users** → **page_permissions** (1:N)

## 🔐 Sistema de Autenticação

### Estrutura de Autenticação Customizada
O sistema utiliza autenticação customizada com Supabase como backend:

#### Arquivos Principais:
- `lib/auth-custom.ts` - Lógica de autenticação
- `context/auth-context.tsx` - Contexto React para auth
- `app/login/page.tsx` - Página de login

#### Fluxo de Autenticação:
1. **Login**: Email + senha → Verificação no Supabase
2. **Sessão**: Token JWT armazenado em cookie httpOnly
3. **Verificação**: Middleware verifica token em cada request
4. **Perfil**: Dados do usuário carregados via context

#### Roles do Sistema:
- **administrator**: Acesso total ao sistema
- **teacher**: Gestão de conteúdo e alunos
- **student**: Acesso aos recursos de estudo

## 📱 Funcionalidades Principais

### 1. **Dashboard** (`/dashboard`)
- Visão geral do progresso do usuário
- Estatísticas de estudo
- Acesso rápido às funcionalidades
- Cards informativos baseados no role

### 2. **Flashcards** (`/flashcards`)
- Sistema de estudo com cartões
- Organização por matérias e tópicos
- Algoritmo de repetição espaçada (SM-2)
- Modo de estudo interativo
- Progresso individual por flashcard

### 3. **Quiz** (`/quiz`)
- Quizzes organizados por tópicos
- Questões de múltipla escolha
- Sistema de pontuação e XP
- Timer opcional
- Explicações das respostas

### 4. **EverCast** (`/evercast`)
- Cursos de áudio organizados
- Player com controles avançados
- Suporte a HLS, MP3 e SoundCloud
- Background audio para PWA
- Download offline (via Service Worker)

### 5. **Calendário** (`/calendario`)
- Eventos e atividades programadas
- Importação de cronogramas
- Visualização por tipo de evento
- Gestão para professores/admins

### 6. **Ranking** (`/ranking`)
- Sistema de pontuação global
- Níveis baseados em XP
- Pódium dos melhores estudantes
- Estatísticas individuais

### 7. **Gestão de Membros** (`/membros`)
- CRUD de estudantes
- Gestão de turmas
- Planos de acesso
- Permissões por página
- Senhas provisórias

### 8. **Admin** (`/admin`)
- Painel administrativo completo
- Estatísticas do sistema
- Gestão de usuários
- Configurações gerais

## 🎨 Design System

### Cores Principais
- **Primária**: Orange (#F97316)
- **Secundária**: Blue (#3B82F6)
- **Sucesso**: Green (#10B981)
- **Erro**: Red (#EF4444)
- **Aviso**: Yellow (#F59E0B)

### Componentes UI
- **Radix UI**: Componentes acessíveis
- **Tailwind CSS**: Estilização utilitária
- **Lucide Icons**: Ícones consistentes
- **Framer Motion**: Animações suaves

### Responsividade
- **Mobile First**: Design otimizado para mobile
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **PWA**: Suporte a Progressive Web App

## 🔧 Configuração e Deploy

### Variáveis de Ambiente
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hnhzindsfuqnaxosujay.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# PandaVideo (para EverCast)
PANDAVIDEO_API_KEY=panda-67b0e45386fbde4995819c39285ea4325fc883d2ea7626316602c0d4cea565ea
PANDAVIDEO_CLIENT_ID=4bd4n813vkn2gf92t2noas02mh
PANDAVIDEO_CLIENT_SECRET=c7u78ql3r9dvfc22hlf0te3s1tlmrs4vj3ok8v2nn8fuv9of9fp
PANDAVIDEO_CALLBACK_URL=https://everestpreparatorios.com.br/api/pandavideo/callback

# App
NEXT_PUBLIC_APP_URL=https://everestpreparatorios.com.br
NODE_ENV=production
```

### Scripts Disponíveis
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm run start

# Linting
npm run lint

# Testes
npm run test
npm run test:watch
npm run test:coverage
```

### Deploy no Vercel
1. Conectar repositório GitHub
2. Configurar variáveis de ambiente
3. Deploy automático a cada push

## 📊 Monitoramento e Analytics

### Logs do Sistema
- Console logs estruturados
- Rastreamento de erros
- Métricas de performance

### Analytics de Uso
- Progresso dos usuários
- Estatísticas de estudo
- Ranking e pontuações

## 🔒 Segurança

### Medidas Implementadas
- Autenticação JWT com cookies httpOnly
- Validação de entrada em todas as APIs
- Rate limiting nas rotas sensíveis
- Sanitização de dados
- CORS configurado adequadamente

### Permissões
- Sistema de roles granular
- Permissões por página
- Middleware de autenticação
- Guards de rota

## 🚀 Performance

### Otimizações
- **Next.js 15**: App Router, Server Components
- **Image Optimization**: Next.js Image
- **Code Splitting**: Lazy loading automático
- **Caching**: Supabase + Next.js cache
- **PWA**: Service Workers para cache offline

### Métricas
- **LCP**: < 2.5s
- **FID**: < 100ms
- **CLS**: < 0.1

## 🧪 Testes

### Estrutura de Testes
- **Jest**: Framework de testes
- **Testing Library**: Testes de componentes
- **MSW**: Mock de APIs

### Cobertura
- Componentes React
- Server Actions
- APIs
- Utilitários

## 📈 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de notificações push
- [ ] Chat em tempo real
- [ ] Relatórios avançados
- [ ] Integração com LMS
- [ ] App mobile nativo
- [ ] IA para recomendações

### Melhorias Técnicas
- [ ] Testes E2E com Playwright
- [ ] Monitoramento com Sentry
- [ ] CDN para assets estáticos
- [ ] Otimização de queries
- [ ] Cache Redis

## 🤝 Contribuição

### Padrões de Código
- **ESLint**: Linting automático
- **Prettier**: Formatação de código
- **Conventional Commits**: Padrão de commits
- **TypeScript**: Tipagem estrita

### Workflow
1. Fork do repositório
2. Branch feature
3. Desenvolvimento
4. Testes
5. Pull Request
6. Code Review
7. Merge

## 📞 Suporte

### Contatos
- **Desenvolvedor Principal**: Geison Höehr
- **Email**: geisonhoehr.ai@gmail.com
- **Co-desenvolvedor**: Tiago Costa

### Documentação Adicional
- [README.md](./README.md) - Guia de início rápido
- [CHANGELOG.md](./CHANGELOG.md) - Histórico de mudanças
- [API.md](./API.md) - Documentação da API

---

**Última atualização**: Janeiro 2025
**Versão**: 2.0.0
**Status**: Produção
