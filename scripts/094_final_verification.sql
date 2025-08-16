-- Script final para verificar se tudo está funcionando
-- Execute este script no Supabase SQL Editor

-- 1. Verificar status geral do banco
SELECT 
  'Status Geral' as info,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM public.user_roles) as total_user_roles,
  (SELECT COUNT(*) FROM public.topics) as total_topics,
  (SELECT COUNT(*) FROM public.flashcards) as total_flashcards;

-- 2. Verificar se todos os usuários têm roles
SELECT 
  'Usuários sem roles' as info,
  COUNT(*) as usuarios_sem_role
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 3. Verificar se há flashcards duplicados
SELECT 
  'Duplicados restantes' as info,
  COUNT(*) as duplicados
FROM (
  SELECT topic_id, question, answer, COUNT(*) as quantidade
  FROM public.flashcards
  GROUP BY topic_id, question, answer
  HAVING COUNT(*) > 1
) as duplicados;

-- 4. Verificar se há tópicos sem flashcards
SELECT 
  'Tópicos sem flashcards' as info,
  t.name as topic_name
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE f.id IS NULL
ORDER BY t.name;

-- 5. Verificar flashcards por tópico (top 10)
SELECT 
  'Top 10 tópicos com mais flashcards' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC
LIMIT 10;

-- 6. Verificar se há problemas de RLS
SELECT 
  'Status RLS user_roles' as info,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_roles';

-- 7. Verificar políticas RLS
SELECT 
  'Políticas RLS user_roles' as info,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE tablename = 'user_roles';

-- 8. Teste de acesso à tabela user_roles
SELECT 
  'Teste de acesso' as info,
  COUNT(*) as total_roles
FROM public.user_roles;

-- 9. Verificar estrutura das tabelas principais
SELECT 
  'Estrutura user_roles' as info,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_roles'
ORDER BY ordinal_position;

-- 10. Resumo final
SELECT 
  'RESUMO FINAL' as info,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.user_roles) 
    THEN '✅ Todos os usuários têm roles'
    ELSE '❌ Há usuários sem roles'
  END as status_roles,
  CASE 
    WHEN (SELECT COUNT(*) FROM (
      SELECT topic_id, question, answer, COUNT(*) as quantidade
      FROM public.flashcards
      GROUP BY topic_id, question, answer
      HAVING COUNT(*) > 1
    ) as duplicados) = 0
    THEN '✅ Não há duplicados'
    ELSE '❌ Ainda há duplicados'
  END as status_duplicados,
  CASE 
    WHEN (SELECT COUNT(*) FROM public.topics) > 0 
    AND (SELECT COUNT(*) FROM public.flashcards) > 0
    THEN '✅ Dados suficientes'
    ELSE '❌ Dados insuficientes'
  END as status_dados; 