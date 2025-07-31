-- Script para importar flashcards gerados pela IA
-- Execute este script no Supabase SQL Editor

-- 1. Verificar status antes da importação
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

-- 2. Converter JSON para INSERT
WITH json_data AS (
  SELECT '[
    {
      "id": 1,
      "pergunta": "O que é hierarquia militar segundo o Estatuto dos Militares?",
      "resposta": "Hierarquia militar é a ordenação da autoridade em níveis diferentes dentro da estrutura das Forças Armadas, fundamentada na antiguidade e nos graus de posto e graduação.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 14"
    },
    {
      "id": 2,
      "pergunta": "Qual é o conceito de disciplina previsto no Estatuto dos Militares?",
      "resposta": "Disciplina é a rigorosa observância e o acatamento integral das leis, regulamentos, normas e disposições que fundamentam a organização militar.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 13"
    },
    {
      "id": 3,
      "pergunta": "O que dispõe a Lei 13.954/2019 sobre o Sistema de Proteção Social dos Militares?",
      "resposta": "Institui as regras para inatividade, pensão e contribuição dos militares, estabelecendo a proteção social específica da categoria.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24"
    },
    {
      "id": 4,
      "pergunta": "Quais são as principais punições previstas no Regulamento Disciplinar do Exército?",
      "resposta": "Advertência, impedimento disciplinar, detenção disciplinar, prisão disciplinar, licenciamento e exclusão a bem da disciplina.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 15"
    },
    {
      "id": 5,
      "pergunta": "Qual o objetivo da Portaria GM-MD 1.143/2022?",
      "resposta": "Estabelecer diretrizes gerais para o funcionamento das Forças Armadas, abrangendo normas disciplinares, rotinas administrativas e organização interna.",
      "topico": "Portaria GM-MD 1.143/2022",
      "tipo": "geral",
      "referencia": "Portaria GM-MD 1.143/2022, art. 1º"
    },
    {
      "id": 6,
      "pergunta": "O que determina o RCA 34-1 sobre as continências?",
      "resposta": "Estabelece normas sobre a execução das continências, sinais de respeito e honras militares entre militares e autoridades.",
      "topico": "RCA 34-1",
      "tipo": "geral",
      "referencia": "RCA 34-1, art. 5º"
    },
    {
      "id": 7,
      "pergunta": "Qual o conceito de transgressão disciplinar conforme o RDAer?",
      "resposta": "Transgressão disciplinar é toda ação ou omissão que viole preceitos éticos e disciplinares previstos nos regulamentos e normas militares.",
      "topico": "RDAer",
      "tipo": "FAB",
      "referencia": "RDAer, art. 10"
    },
    {
      "id": 8,
      "pergunta": "Segundo a ICA 111-1, o que são as Organizações Militares (OM) da FAB?",
      "resposta": "São órgãos que compõem a Força Aérea Brasileira, com missões específicas, subordinadas a comandos e chefias superiores.",
      "topico": "ICA 111-1",
      "tipo": "FAB",
      "referencia": "ICA 111-1, art. 3º"
    },
    {
      "id": 9,
      "pergunta": "Quais são os principais tipos de uniforme estabelecidos pela ICA 111-2?",
      "resposta": "Uniforme Azul, Uniforme de Gala, Uniforme de Serviço, Uniforme Operacional, entre outros.",
      "topico": "ICA 111-2",
      "tipo": "FAB",
      "referencia": "ICA 111-2, art. 8º"
    },
    {
      "id": 10,
      "pergunta": "O que regula a ICA 111-3 quanto ao cerimonial militar da Aeronáutica?",
      "resposta": "Regras e procedimentos para solenidades, formaturas, desfiles e outros atos solenes dentro da FAB.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 12"
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
      WHEN value->>'topico' LIKE '%RDE%' OR value->>'topico' LIKE '%Exército%' THEN 'regulamentos-comuns'
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

-- 3. Executar os INSERTs (descomente as linhas abaixo após verificar os comandos gerados)
/*
INSERT INTO public.flashcards (topic_id, question, answer) VALUES 
  ('estatuto-militares', 'O que é hierarquia militar segundo o Estatuto dos Militares?', 'Hierarquia militar é a ordenação da autoridade em níveis diferentes dentro da estrutura das Forças Armadas, fundamentada na antiguidade e nos graus de posto e graduação.'),
  ('estatuto-militares', 'Qual é o conceito de disciplina previsto no Estatuto dos Militares?', 'Disciplina é a rigorosa observância e o acatamento integral das leis, regulamentos, normas e disposições que fundamentam a organização militar.'),
  ('lei-13954-2019', 'O que dispõe a Lei 13.954/2019 sobre o Sistema de Proteção Social dos Militares?', 'Institui as regras para inatividade, pensão e contribuição dos militares, estabelecendo a proteção social específica da categoria.'),
  ('regulamentos-comuns', 'Quais são as principais punições previstas no Regulamento Disciplinar do Exército?', 'Advertência, impedimento disciplinar, detenção disciplinar, prisão disciplinar, licenciamento e exclusão a bem da disciplina.'),
  ('portaria-gm-md-1143-2022', 'Qual o objetivo da Portaria GM-MD 1.143/2022?', 'Estabelecer diretrizes gerais para o funcionamento das Forças Armadas, abrangendo normas disciplinares, rotinas administrativas e organização interna.'),
  ('rca-34-1', 'O que determina o RCA 34-1 sobre as continências?', 'Estabelece normas sobre a execução das continências, sinais de respeito e honras militares entre militares e autoridades.'),
  ('rdaer', 'Qual o conceito de transgressão disciplinar conforme o RDAer?', 'Transgressão disciplinar é toda ação ou omissão que viole preceitos éticos e disciplinares previstos nos regulamentos e normas militares.'),
  ('ica-111-1', 'Segundo a ICA 111-1, o que são as Organizações Militares (OM) da FAB?', 'São órgãos que compõem a Força Aérea Brasileira, com missões específicas, subordinadas a comandos e chefias superiores.'),
  ('ica-111-2', 'Quais são os principais tipos de uniforme estabelecidos pela ICA 111-2?', 'Uniforme Azul, Uniforme de Gala, Uniforme de Serviço, Uniforme Operacional, entre outros.'),
  ('ica-111-3', 'O que regula a ICA 111-3 quanto ao cerimonial militar da Aeronáutica?', 'Regras e procedimentos para solenidades, formaturas, desfiles e outros atos solenes dentro da FAB.');
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