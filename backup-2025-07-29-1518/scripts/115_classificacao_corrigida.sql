-- Classificação correta dos flashcards
-- Execute este script no Supabase SQL Editor

-- Classificação corrigida
SELECT 
  'CLASSIFICAÇÃO CORRIGIDA' as info,
  CASE 
    WHEN topic_id IN (
      'ica-111-6',
      'estatuto-militares',
      'ica-111-3',
      'rdaer',
      'ica-111-2',
      'portaria-gm-md-1143-2022',
      'rca-34-1',
      'lei-13954-2019',
      'ica-111-1',
      'regulamentos-comuns'
    ) OR topic_id LIKE '%regulamento%' THEN 'Regulamentos Militares'
    WHEN topic_id IN (
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
    ) THEN 'Português'
    ELSE 'Outros'
  END as categoria,
  COUNT(*) as quantidade
FROM public.flashcards 
GROUP BY 
  CASE 
    WHEN topic_id IN (
      'ica-111-6',
      'estatuto-militares',
      'ica-111-3',
      'rdaer',
      'ica-111-2',
      'portaria-gm-md-1143-2022',
      'rca-34-1',
      'lei-13954-2019',
      'ica-111-1',
      'regulamentos-comuns'
    ) OR topic_id LIKE '%regulamento%' THEN 'Regulamentos Militares'
    WHEN topic_id IN (
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
    ) THEN 'Português'
    ELSE 'Outros'
  END
ORDER BY quantidade DESC; 