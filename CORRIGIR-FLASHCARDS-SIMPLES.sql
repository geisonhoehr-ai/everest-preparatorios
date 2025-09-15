-- Script SIMPLES para corrigir flashcards
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se a tabela flashcards existe
SELECT 'Verificando tabela flashcards...' as status;
SELECT COUNT(*) as total_flashcards FROM flashcards;

-- 2. Desabilitar RLS para permitir acesso público
ALTER TABLE flashcards DISABLE ROW LEVEL SECURITY;

-- 3. Verificar se funcionou
SELECT 'Testando acesso...' as status;
SELECT id, topic_id, LEFT(question, 30) as question_preview 
FROM flashcards 
LIMIT 3;

-- 4. Mostrar topic_ids únicos
SELECT 'Topic IDs únicos:' as status;
SELECT DISTINCT topic_id 
FROM flashcards 
LIMIT 10;
