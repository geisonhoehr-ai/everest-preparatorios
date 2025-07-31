-- Script para verificar dados e corrigir problemas
-- Execute este script no Supabase SQL Editor

-- 1. Verificar se há dados na tabela topics
SELECT 
  'Dados na tabela topics' as info,
  COUNT(*) as total_topics
FROM public.topics;

-- 2. Listar todos os tópicos
SELECT 
  'Tópicos existentes' as info,
  id,
  name,
  user_uuid,
  subject_id
FROM public.topics
ORDER BY name;

-- 3. Verificar se há dados na tabela flashcards
SELECT 
  'Dados na tabela flashcards' as info,
  COUNT(*) as total_flashcards
FROM public.flashcards;

-- 4. Verificar se há flashcards por tópico
SELECT 
  'Flashcards por tópico' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY t.name;

-- 5. Se não há tópicos, inserir tópicos padrão
INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'fonetica-fonologia' as id,
  'Fonetica e Fonologia' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'fonetica-fonologia');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'ortografia' as id,
  'Ortografia' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'ortografia');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'acentuacao-grafica' as id,
  'Acentuação Gráfica' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'acentuacao-grafica');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'morfologia-classes' as id,
  'Morfologia: Classes de Palavras' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'morfologia-classes');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'morfologia-flexao' as id,
  'Morfologia: Flexão' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'morfologia-flexao');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'sintaxe-termos-essenciais' as id,
  'Sintaxe: Termos Essenciais' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'sintaxe-termos-essenciais');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'sintaxe-termos-integrantes' as id,
  'Sintaxe: Termos Integrantes' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'sintaxe-termos-integrantes');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'sintaxe-termos-acessorios' as id,
  'Sintaxe: Termos Acessórios' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'sintaxe-termos-acessorios');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'sintaxe-periodo-composto' as id,
  'Sintaxe: Período Composto' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'sintaxe-periodo-composto');

INSERT INTO public.topics (id, name, subject_id) 
SELECT 
  'concordancia' as id,
  'Concordância Verbal e Nominal' as name,
  1 as subject_id
WHERE NOT EXISTS (SELECT 1 FROM public.topics WHERE id = 'concordancia');

-- 6. Se não há flashcards, inserir alguns flashcards de exemplo
INSERT INTO public.flashcards (topic_id, question, answer)
SELECT 
  'fonetica-fonologia' as topic_id,
  'O que é fonema?' as question,
  'Fonema é a menor unidade sonora distintiva de uma língua.' as answer
WHERE NOT EXISTS (
  SELECT 1 FROM public.flashcards 
  WHERE topic_id = 'fonetica-fonologia' 
  AND question = 'O que é fonema?'
);

INSERT INTO public.flashcards (topic_id, question, answer)
SELECT 
  'ortografia' as topic_id,
  'Como se escreve "exceção"?' as question,
  'Exceção se escreve com "x" e "ç".' as answer
WHERE NOT EXISTS (
  SELECT 1 FROM public.flashcards 
  WHERE topic_id = 'ortografia' 
  AND question = 'Como se escreve "exceção"?'
);

INSERT INTO public.flashcards (topic_id, question, answer)
SELECT 
  'acentuacao-grafica' as topic_id,
  'Qual é a regra de acentuação das paroxítonas?' as question,
  'Paroxítonas terminadas em a, e, o, em, ens são acentuadas.' as answer
WHERE NOT EXISTS (
  SELECT 1 FROM public.flashcards 
  WHERE topic_id = 'acentuacao-grafica' 
  AND question = 'Qual é a regra de acentuação das paroxítonas?'
);

-- 7. Verificar se há usuários sem roles
SELECT 
  'Usuários sem roles' as info,
  u.id,
  u.email
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 8. Inserir roles para usuários que não têm
INSERT INTO public.user_roles (user_uuid, role, first_login, profile_completed)
SELECT 
  u.id as user_uuid,
  'student' as role,
  true as first_login,
  false as profile_completed
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_uuid
WHERE ur.user_uuid IS NULL;

-- 9. Verificar resultado final
SELECT 
  'Status final' as info,
  (SELECT COUNT(*) FROM public.topics) as total_topics,
  (SELECT COUNT(*) FROM public.flashcards) as total_flashcards,
  (SELECT COUNT(*) FROM public.user_roles) as total_user_roles,
  (SELECT COUNT(*) FROM auth.users) as total_users; 