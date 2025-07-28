-- Verificação rápida do total de flashcards
-- Execute este script no Supabase SQL Editor

-- Total geral
SELECT 'TOTAL GERAL' as info, COUNT(*) as quantidade FROM public.flashcards;

-- Total por categoria
SELECT 
  CASE 
    WHEN topic_id LIKE '%regulamento%' THEN 'Regulamentos'
    WHEN topic_id IN ('sintaxe-termos-integrantes','regencia','crase','morfologia-flexao','fonetica-fonologia','acentuacao-grafica','ortografia','colocacao-pronominal','morfologia-classes','semantica-estilistica','sintaxe-periodo-composto','sintaxe-termos-acessorios','sintaxe-termos-essenciais','concordancia') THEN 'Português'
    ELSE 'Outros'
  END as categoria,
  COUNT(*) as quantidade
FROM public.flashcards 
GROUP BY 
  CASE 
    WHEN topic_id LIKE '%regulamento%' THEN 'Regulamentos'
    WHEN topic_id IN ('sintaxe-termos-integrantes','regencia','crase','morfologia-flexao','fonetica-fonologia','acentuacao-grafica','ortografia','colocacao-pronominal','morfologia-classes','semantica-estilistica','sintaxe-periodo-composto','sintaxe-termos-acessorios','sintaxe-termos-essenciais','concordancia') THEN 'Português'
    ELSE 'Outros'
  END
ORDER BY quantidade DESC; 