-- Script para importar flashcards de regulamentos militares gerados pela IA
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar quantos flashcards existem antes da importação
SELECT 
  'Antes da importação' as info,
  COUNT(*) as total_flashcards
FROM public.flashcards;

-- 2. Verificar flashcards de regulamentos por tópico antes da importação
SELECT 
  'Flashcards de regulamentos por tópico (antes)' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE t.id IN (
  'estatuto-militares',
  'lei-13954-2019',
  'portaria-gm-md-1143-2022',
  'rca-34-1',
  'rdaer',
  'ica-111-1',
  'ica-111-2',
  'ica-111-3',
  'ica-111-6',
  'regulamentos-comuns'
)
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC;

-- 3. IMPORTAR NOVOS FLASHCARDS DE REGULAMENTOS (substitua os valores pelos gerados pela IA)
-- Exemplo de como inserir:
/*
INSERT INTO public.flashcards (topic_id, question, answer)
VALUES 
  ('estatuto-militares', 'O que é o Estatuto dos Militares?', 'O Estatuto dos Militares (Lei nº 6.880/1980) é a lei que regula os direitos, deveres e responsabilidades dos militares das Forças Armadas.'),
  ('lei-13954-2019', 'Qual o objetivo da Lei 13.954/2019?', 'A Lei 13.954/2019 estabelece normas gerais sobre o processo administrativo disciplinar militar e outras disposições relacionadas à disciplina militar.'),
  ('portaria-gm-md-1143-2022', 'O que estabelece a Portaria GM-MD 1.143/2022?', 'A Portaria estabelece normas sobre continências, sinais de respeito e procedimentos cerimoniais padronizados entre as Forças Armadas.'),
  ('rca-34-1', 'O que é o RCA 34-1?', 'O RCA 34-1 é o Regulamento de Continências e Sinais de Respeito que estabelece as normas para continências e cerimônias militares.'),
  ('rdaer', 'O que é o RDAER?', 'O RDAER é o Regulamento de Disciplina da Aeronáutica que estabelece as normas disciplinares específicas da Força Aérea Brasileira.'),
  ('ica-111-1', 'O que são as ICAs?', 'ICAs são Instruções do Comando da Aeronáutica que estabelecem normas técnicas e procedimentos específicos da FAB.'),
  ('ica-111-2', 'Qual a função das ICAs?', 'As ICAs padronizam procedimentos operacionais, técnicos e administrativos específicos da Força Aérea Brasileira.'),
  ('ica-111-3', 'Como as ICAs se relacionam com a disciplina?', 'As ICAs complementam os regulamentos disciplinares estabelecendo procedimentos específicos para diferentes situações na FAB.'),
  ('ica-111-6', 'Por que as ICAs são importantes?', 'As ICAs são importantes para garantir a padronização e eficiência dos procedimentos militares da Aeronáutica.'),
  ('regulamentos-comuns', 'O que são regulamentos comuns?', 'Regulamentos comuns são normas que se aplicam a todas as Forças Armadas, garantindo uniformidade nos procedimentos militares.');
*/

-- 4. Verificar quantos flashcards existem após a importação
SELECT 
  'Após a importação' as info,
  COUNT(*) as total_flashcards
FROM public.flashcards;

-- 5. Verificar flashcards de regulamentos por tópico após a importação
SELECT 
  'Flashcards de regulamentos por tópico (depois)' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE t.id IN (
  'estatuto-militares',
  'lei-13954-2019',
  'portaria-gm-md-1143-2022',
  'rca-34-1',
  'rdaer',
  'ica-111-1',
  'ica-111-2',
  'ica-111-3',
  'ica-111-6',
  'regulamentos-comuns'
)
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC;

-- 6. Verificar se há duplicados após a importação
SELECT 
  'Verificação de duplicados' as info,
  COUNT(*) as duplicados
FROM (
  SELECT topic_id, question, answer, COUNT(*) as quantidade
  FROM public.flashcards
  GROUP BY topic_id, question, answer
  HAVING COUNT(*) > 1
) as duplicados;

-- 7. Listar alguns flashcards de regulamentos recentes para verificação
SELECT 
  'Flashcards de regulamentos recentes' as info,
  f.id,
  f.topic_id,
  t.name as topic_name,
  LEFT(f.question, 50) as question_preview,
  LEFT(f.answer, 50) as answer_preview
FROM public.flashcards f
LEFT JOIN public.topics t ON f.topic_id = t.id
WHERE t.id IN (
  'estatuto-militares',
  'lei-13954-2019',
  'portaria-gm-md-1143-2022',
  'rca-34-1',
  'rdaer',
  'ica-111-1',
  'ica-111-2',
  'ica-111-3',
  'ica-111-6',
  'regulamentos-comuns'
)
ORDER BY f.id DESC
LIMIT 10;

-- 8. Resumo final dos regulamentos
SELECT 
  'RESUMO FINAL REGULAMENTOS' as info,
  COUNT(*) as total_flashcards_regulamentos,
  COUNT(DISTINCT topic_id) as total_topicos_regulamentos
FROM public.flashcards f
WHERE f.topic_id IN (
  'estatuto-militares',
  'lei-13954-2019',
  'portaria-gm-md-1143-2022',
  'rca-34-1',
  'rdaer',
  'ica-111-1',
  'ica-111-2',
  'ica-111-3',
  'ica-111-6',
  'regulamentos-comuns'
); 