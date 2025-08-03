-- Script para importar flashcards gerados pela IA
-- Execute este script no Supabase SQL Editor

-- 1. Primeiro, vamos verificar quantos flashcards existem antes da importação
SELECT 
  'Antes da importação' as info,
  COUNT(*) as total_flashcards
FROM public.flashcards;

-- 2. Verificar flashcards por tópico antes da importação
SELECT 
  'Flashcards por tópico (antes)' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC;

-- 3. IMPORTAR NOVOS FLASHCARDS (substitua os valores pelos gerados pela IA)
-- Exemplo de como inserir:
/*
INSERT INTO public.flashcards (topic_id, question, answer)
VALUES 
  ('fonetica-fonologia', 'O que é um fonema?', 'Fonema é a menor unidade sonora distintiva de uma língua.'),
  ('ortografia', 'Qual a diferença entre "mas" e "mais"?', '"Mas" é conjunção adversativa. "Mais" é advérbio de intensidade.'),
  ('acentuacao-grafica', 'Quando acentuar oxítonas?', 'Oxítonas terminadas em a, e, o, em, ens são acentuadas.'),
  ('morfologia-classes', 'O que é um substantivo?', 'Substantivo é a classe de palavras que nomeia seres, objetos, lugares, etc.'),
  ('morfologia-flexao', 'O que é flexão de gênero?', 'Flexão de gênero é a variação que indica masculino ou feminino.'),
  ('sintaxe-termos-essenciais', 'O que é sujeito?', 'Sujeito é o termo que pratica ou sofre a ação expressa pelo verbo.'),
  ('sintaxe-termos-integrantes', 'O que é objeto direto?', 'Objeto direto é o termo que completa o sentido de verbos transitivos diretos.'),
  ('sintaxe-termos-acessorios', 'O que é adjunto adverbial?', 'Adjunto adverbial é o termo que indica circunstância do fato.'),
  ('sintaxe-periodo-composto', 'O que é oração coordenada?', 'Oração coordenada é aquela que não exerce função sintática em relação à outra.'),
  ('concordancia', 'O que é concordância verbal?', 'Concordância verbal é a relação entre o verbo e seu sujeito em pessoa e número.'),
  ('regencia-verbal-nominal', 'O que é regência verbal?', 'Regência verbal é a relação entre o verbo e seus complementos.'),
  ('crase', 'Quando usar crase?', 'Crase é usada antes de palavras femininas que exigem a preposição "a".'),
  ('colocacao-pronominal', 'O que é próclise?', 'Próclise é a colocação do pronome antes do verbo.'),
  ('semantica-estilistica', 'O que é sinonímia?', 'Sinonímia é a relação de sentido entre palavras de significados similares.');
*/

-- 4. Verificar quantos flashcards existem após a importação
SELECT 
  'Após a importação' as info,
  COUNT(*) as total_flashcards
FROM public.flashcards;

-- 5. Verificar flashcards por tópico após a importação
SELECT 
  'Flashcards por tópico (depois)' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
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

-- 7. Listar alguns flashcards recentes para verificação
SELECT 
  'Flashcards recentes' as info,
  f.id,
  f.topic_id,
  t.name as topic_name,
  LEFT(f.question, 50) as question_preview,
  LEFT(f.answer, 50) as answer_preview
FROM public.flashcards f
LEFT JOIN public.topics t ON f.topic_id = t.id
ORDER BY f.id DESC
LIMIT 10; 