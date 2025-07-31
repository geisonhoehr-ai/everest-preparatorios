-- Script para importar flashcards de Português (Livro Cegalla)
-- Execute este script no Supabase SQL Editor

-- 1. Verificar status antes da importação
SELECT 
  'STATUS ANTES DA IMPORTAÇÃO' as info,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
FROM public.flashcards f
WHERE f.topic_id IN (
  'sintaxe-termos-integrantes',
  'regencia',
  'crase',
  'morfologia-flexao',
  'fonetica-fonologia',
  'acentuacao-grafica',
  'ortografia',
  'colocacao-pronominal',
  'morfologia-classes',
  'semantica-estilistica',
  'sintaxe-periodo-composto',
  'sintaxe-termos-acessorios',
  'sintaxe-termos-essenciais',
  'concordancia'
);

-- 2. Verificar flashcards por tópico existente
SELECT 
  'FLASHCARDS POR TÓPICO EXISTENTE' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE t.id IN (
  'sintaxe-termos-integrantes',
  'regencia',
  'crase',
  'morfologia-flexao',
  'fonetica-fonologia',
  'acentuacao-grafica',
  'ortografia',
  'colocacao-pronominal',
  'morfologia-classes',
  'semantica-estilistica',
  'sintaxe-periodo-composto',
  'sintaxe-termos-acessorios',
  'sintaxe-termos-essenciais',
  'concordancia'
)
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name;

-- 3. Importar flashcards de Português (exemplo - será substituído pelos dados reais)
-- NOTA: Este é um template. Os dados reais serão inseridos quando você fornecer os flashcards gerados pela IA

-- Exemplo de estrutura para importação:
/*
INSERT INTO public.flashcards (topic_id, question, answer) VALUES 
  ('morfologia-classes', 'Qual é a função do artigo na língua portuguesa?', 'O artigo é uma classe gramatical que antecede o substantivo, determinando-o e indicando gênero, número e especificidade.'),
  ('morfologia-flexao', 'O que é flexão de gênero?', 'Flexão de gênero é a variação que o substantivo sofre para indicar masculino ou feminino.'),
  ('sintaxe-termos-essenciais', 'Como se classifica o sujeito na análise sintática?', 'O sujeito pode ser classificado como: determinado (simples, composto, oculto), indeterminado ou inexistente.'),
  ('semantica-estilistica', 'O que é polissemia?', 'Polissemia é o fenômeno em que uma palavra possui múltiplos significados relacionados entre si.'),
  ('regencia', 'Qual a regência do verbo "assistir"?', 'O verbo "assistir" pode ser transitivo direto (assistir um filme) ou transitivo indireto (assistir a um filme).'),
  ('crase', 'Quando se usa a crase?', 'A crase é usada quando há fusão da preposição "a" com o artigo "a" ou com pronomes demonstrativos "a", "as".'),
  ('concordancia', 'Como funciona a concordância verbal?', 'O verbo concorda em pessoa e número com o sujeito da oração.'),
  ('colocacao-pronominal', 'O que é próclise?', 'Próclise é a colocação do pronome oblíquo antes do verbo.'),
  ('acentuacao-grafica', 'Quando se acentua as paroxítonas?', 'As paroxítonas são acentuadas quando terminam em ditongo, vogal nasal, ou consoantes específicas.'),
  ('ortografia', 'Quando se usa "ss" e quando se usa "ç"?', 'Usa-se "ss" entre vogais e "ç" antes de "a", "o", "u".'),
  ('fonetica-fonologia', 'O que é fonema?', 'Fonema é a menor unidade sonora distintiva de uma língua.'),
  ('sintaxe-periodo-composto', 'O que são orações coordenadas?', 'Orações coordenadas são aquelas que não dependem sintaticamente uma da outra.'),
  ('sintaxe-termos-acessorios', 'O que é adjunto adnominal?', 'Adjunto adnominal é o termo que modifica um substantivo, especificando-o.'),
  ('sintaxe-termos-integrantes', 'O que é objeto direto?', 'Objeto direto é o complemento verbal que não é regido por preposição.');
*/

-- 4. Verificar status após a importação
SELECT 
  'STATUS APÓS IMPORTAÇÃO' as info,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
FROM public.flashcards f
WHERE f.topic_id IN (
  'sintaxe-termos-integrantes',
  'regencia',
  'crase',
  'morfologia-flexao',
  'fonetica-fonologia',
  'acentuacao-grafica',
  'ortografia',
  'colocacao-pronominal',
  'morfologia-classes',
  'semantica-estilistica',
  'sintaxe-periodo-composto',
  'sintaxe-termos-acessorios',
  'sintaxe-termos-essenciais',
  'concordancia'
);

-- 5. Verificar flashcards por tópico final
SELECT 
  'FLASHCARDS POR TÓPICO FINAL' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE t.id IN (
  'sintaxe-termos-integrantes',
  'regencia',
  'crase',
  'morfologia-flexao',
  'fonetica-fonologia',
  'acentuacao-grafica',
  'ortografia',
  'colocacao-pronominal',
  'morfologia-classes',
  'semantica-estilistica',
  'sintaxe-periodo-composto',
  'sintaxe-termos-acessorios',
  'sintaxe-termos-essenciais',
  'concordancia'
)
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name; 