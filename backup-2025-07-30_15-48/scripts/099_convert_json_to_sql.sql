-- Script para converter JSON detalhado para formato do banco
-- Execute este script no Supabase SQL Editor

-- 1. Função para converter JSON detalhado para INSERT
-- Substitua o JSON gerado pela IA no lugar de 'JSON_AQUI'

/*
-- Exemplo de como usar:
-- 1. Cole o JSON gerado pela IA aqui
-- 2. Execute o script para gerar os INSERTs
-- 3. Execute os INSERTs no banco

WITH json_data AS (
  SELECT '[
    {
      "id": 1,
      "pergunta": "O que é disciplina, segundo o Regulamento Disciplinar da Aeronáutica (RDAer)?",
      "resposta": "Disciplina é a rigorosa observância e o acatamento integral das leis, regulamentos, normas e disposições que fundamentam a organização militar e o exercício da autoridade.",
      "topico": "Regulamento Disciplinar da Aeronáutica",
      "tipo": "FAB",
      "referencia": "RDAer, art. 2º"
    },
    {
      "id": 2,
      "pergunta": "Qual é o conceito de hierarquia militar conforme o Estatuto dos Militares?",
      "resposta": "Hierarquia militar é a ordenação da autoridade em níveis diferentes dentro da estrutura das Forças Armadas, conforme o posto ou graduação.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 14"
    }
  ]'::json as data
),
parsed_data AS (
  SELECT 
    (value->>'id')::int as id,
    value->>'pergunta' as question,
    value->>'resposta' as answer,
    value->>'topico' as topico,
    value->>'tipo' as tipo,
    value->>'referencia' as referencia,
    CASE 
      WHEN value->>'topico' LIKE '%Estatuto%' THEN 'estatuto-militares'
      WHEN value->>'topico' LIKE '%Lei 13.954%' THEN 'lei-13954-2019'
      WHEN value->>'topico' LIKE '%Portaria GM-MD%' THEN 'portaria-gm-md-1143-2022'
      WHEN value->>'topico' LIKE '%RCA%' THEN 'rca-34-1'
      WHEN value->>'topico' LIKE '%Comuns%' THEN 'regulamentos-comuns'
      WHEN value->>'topico' LIKE '%RDAER%' OR value->>'topico' LIKE '%Aeronáutica%' THEN 'rdaer'
      WHEN value->>'topico' LIKE '%ICA 111-1%' THEN 'ica-111-1'
      WHEN value->>'topico' LIKE '%ICA 111-2%' THEN 'ica-111-2'
      WHEN value->>'topico' LIKE '%ICA 111-3%' THEN 'ica-111-3'
      WHEN value->>'topico' LIKE '%ICA 111-6%' THEN 'ica-111-6'
      ELSE 'regulamentos-comuns'
    END as topic_id
  FROM json_data, json_array_elements(json_data.data) as value
)
SELECT 
  'INSERT INTO public.flashcards (topic_id, question, answer) VALUES (' ||
  '''' || topic_id || ''', ' ||
  '''' || REPLACE(question, '''', '''''') || ''', ' ||
  '''' || REPLACE(answer, '''', '''''') || ''');' as insert_statement
FROM parsed_data
ORDER BY id;
*/

-- 2. Verificar status antes da importação
SELECT 
  'STATUS ANTES DA IMPORTAÇÃO' as info,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
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

-- 3. Exemplo de INSERT direto (substitua pelos dados gerados pela IA)
/*
INSERT INTO public.flashcards (topic_id, question, answer) VALUES 
  ('estatuto-militares', 'O que é o Estatuto dos Militares?', 'O Estatuto dos Militares (Lei nº 6.880/1980) é a lei que regula os direitos, deveres e responsabilidades dos militares das Forças Armadas.'),
  ('lei-13954-2019', 'Qual o objetivo da Lei 13.954/2019?', 'A Lei 13.954/2019 estabelece normas gerais sobre o processo administrativo disciplinar militar e outras disposições relacionadas à disciplina militar.'),
  ('rdaer', 'O que é disciplina, segundo o RDAer?', 'Disciplina é a rigorosa observância e o acatamento integral das leis, regulamentos, normas e disposições que fundamentam a organização militar e o exercício da autoridade.'),
  ('ica-111-1', 'O que são as ICAs?', 'ICAs são Instruções do Comando da Aeronáutica que estabelecem normas técnicas e procedimentos específicos da FAB.');
*/

-- 4. Verificar status após a importação
SELECT 
  'STATUS APÓS IMPORTAÇÃO' as info,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
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

-- 5. Verificar flashcards por tópico
SELECT 
  'FLASHCARDS POR TÓPICO' as info,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count,
  CASE 
    WHEN t.id IN ('estatuto-militares', 'lei-13954-2019', 'portaria-gm-md-1143-2022', 'rca-34-1', 'regulamentos-comuns') 
    THEN 'GERAL'
    ELSE 'FAB'
  END as tipo_regulamento
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
ORDER BY flashcard_count DESC, t.name;

-- 6. Resumo final
SELECT 
  'RESUMO FINAL' as info,
  CASE 
    WHEN topic_id IN ('estatuto-militares', 'lei-13954-2019', 'portaria-gm-md-1143-2022', 'rca-34-1', 'regulamentos-comuns') 
    THEN 'REGULAMENTOS GERAIS'
    ELSE 'REGULAMENTOS FAB'
  END as tipo_regulamento,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
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
)
GROUP BY 
  CASE 
    WHEN topic_id IN ('estatuto-militares', 'lei-13954-2019', 'portaria-gm-md-1143-2022', 'rca-34-1', 'regulamentos-comuns') 
    THEN 'REGULAMENTOS GERAIS'
    ELSE 'REGULAMENTOS FAB'
  END
ORDER BY tipo_regulamento; 