-- Script final para importar flashcards de regulamentos militares
-- Execute este script no Supabase SQL Editor

-- 1. Verificar status atual dos regulamentos
SELECT 
  'STATUS ATUAL REGULAMENTOS' as info,
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

-- 2. Verificar flashcards por tópico (antes da importação)
SELECT 
  'FLASHCARDS POR TÓPICO (ANTES)' as info,
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

-- 3. IMPORTAR NOVOS FLASHCARDS DE REGULAMENTOS
-- Substitua os valores abaixo pelos flashcards gerados pela IA
-- Exemplo de como inserir:

/*
INSERT INTO public.flashcards (topic_id, question, answer)
VALUES 
  -- REGULAMENTOS GERAIS
  ('estatuto-militares', 'O que é o Estatuto dos Militares?', 'O Estatuto dos Militares (Lei nº 6.880/1980) é a lei que regula os direitos, deveres e responsabilidades dos militares das Forças Armadas.'),
  ('estatuto-militares', 'Quais são os princípios da hierarquia militar?', 'Os princípios da hierarquia militar são: autoridade, responsabilidade, disciplina e respeito. A hierarquia garante a organização e eficiência das Forças Armadas.'),
  ('estatuto-militares', 'O que estabelece o Art. 1º do Estatuto dos Militares?', 'O Art. 1º estabelece que o Estatuto dos Militares regula a situação, os deveres, os direitos e a responsabilidade dos militares das Forças Armadas.'),
  
  ('lei-13954-2019', 'Qual o objetivo da Lei 13.954/2019?', 'A Lei 13.954/2019 estabelece normas gerais sobre o processo administrativo disciplinar militar e outras disposições relacionadas à disciplina militar.'),
  ('lei-13954-2019', 'O que é processo administrativo disciplinar militar?', 'É o conjunto de atos administrativos destinados a apurar a responsabilidade disciplinar do militar e aplicar a penalidade adequada.'),
  ('lei-13954-2019', 'Quais são as infrações disciplinares militares?', 'As infrações disciplinares militares são: leves, médias e graves, conforme a gravidade da conduta e as circunstâncias do fato.'),
  
  ('portaria-gm-md-1143-2022', 'O que estabelece a Portaria GM-MD 1.143/2022?', 'A Portaria estabelece normas sobre continências, sinais de respeito e procedimentos cerimoniais padronizados entre as Forças Armadas.'),
  ('portaria-gm-md-1143-2022', 'Qual o objetivo da padronização de continências?', 'A padronização visa garantir uniformidade nos procedimentos cerimoniais entre as três Forças Armadas.'),
  ('portaria-gm-md-1143-2022', 'Como deve ser feita a continência entre militares?', 'A continência deve ser feita com a mão direita, dedos unidos e estendidos, polegar junto ao indicador, palma da mão voltada para baixo.'),
  
  ('rca-34-1', 'O que é o RCA 34-1?', 'O RCA 34-1 é o Regulamento de Continências e Sinais de Respeito que estabelece as normas para continências e cerimônias militares.'),
  ('rca-34-1', 'Quando deve ser feita a continência?', 'A continência deve ser feita quando militares se encontram, ao passar por autoridades superiores e em cerimônias militares.'),
  ('rca-34-1', 'O que são os toques de corneta?', 'Os toques de corneta são sinais sonoros que regulam a vida militar, indicando horários e procedimentos específicos.'),
  
  ('regulamentos-comuns', 'O que são regulamentos comuns?', 'Regulamentos comuns são normas que se aplicam a todas as Forças Armadas, garantindo uniformidade nos procedimentos militares.'),
  ('regulamentos-comuns', 'Por que são importantes os regulamentos comuns?', 'Os regulamentos comuns garantem a integração e padronização entre Exército, Marinha e Aeronáutica.'),
  ('regulamentos-comuns', 'Como os regulamentos comuns afetam a hierarquia?', 'Os regulamentos comuns estabelecem normas de precedência e respeito entre as três Forças Armadas.'),
  
  -- REGULAMENTOS ESPECÍFICOS DA FAB
  ('rdaer', 'O que é o RDAER?', 'O RDAER é o Regulamento de Disciplina da Aeronáutica que estabelece as normas disciplinares específicas da Força Aérea Brasileira.'),
  ('rdaer', 'Qual a aplicação do RDAER?', 'O RDAER se aplica exclusivamente aos militares da Aeronáutica, estabelecendo normas disciplinares específicas da FAB.'),
  ('rdaer', 'Como o RDAER complementa o Estatuto dos Militares?', 'O RDAER complementa o Estatuto dos Militares com normas específicas da Aeronáutica, sem contrariar a legislação geral.'),
  
  ('ica-111-1', 'O que são as ICAs?', 'ICAs são Instruções do Comando da Aeronáutica que estabelecem normas técnicas e procedimentos específicos da FAB.'),
  ('ica-111-1', 'Qual a função das ICAs na FAB?', 'As ICAs padronizam procedimentos operacionais, técnicos e administrativos específicos da Força Aérea Brasileira.'),
  ('ica-111-1', 'Como as ICAs se relacionam com a disciplina?', 'As ICAs complementam os regulamentos disciplinares estabelecendo procedimentos específicos para diferentes situações na FAB.'),
  
  ('ica-111-2', 'Qual a diferença entre ICAs e regulamentos?', 'As ICAs são instruções específicas que detalham procedimentos, enquanto os regulamentos estabelecem normas gerais de disciplina.'),
  ('ica-111-2', 'Como as ICAs afetam a operação da FAB?', 'As ICAs garantem a padronização e eficiência dos procedimentos militares da Aeronáutica em suas operações.'),
  ('ica-111-2', 'Por que as ICAs são importantes para a FAB?', 'As ICAs são importantes para garantir a padronização e eficiência dos procedimentos militares da Aeronáutica.'),
  
  ('ica-111-3', 'Como as ICAs se aplicam na aviação militar?', 'As ICAs estabelecem procedimentos específicos para operações aéreas e manutenção de aeronaves militares.'),
  ('ica-111-3', 'Qual o papel das ICAs na segurança de voo?', 'As ICAs estabelecem normas de segurança específicas para operações aéreas da FAB.'),
  ('ica-111-3', 'Como as ICAs regulam a manutenção aeronáutica?', 'As ICAs estabelecem procedimentos técnicos para manutenção e inspeção de aeronaves militares.'),
  
  ('ica-111-6', 'Como as ICAs afetam a organização da FAB?', 'As ICAs estabelecem a estrutura organizacional e procedimentos administrativos específicos da Aeronáutica.'),
  ('ica-111-6', 'Qual a relação entre ICAs e hierarquia da FAB?', 'As ICAs complementam a hierarquia militar estabelecendo procedimentos específicos para cada nível da FAB.'),
  ('ica-111-6', 'Como as ICAs garantem a eficiência da FAB?', 'As ICAs padronizam procedimentos garantindo eficiência operacional e administrativa da Força Aérea Brasileira.');
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

-- 5. Verificar flashcards por tópico (após a importação)
SELECT 
  'FLASHCARDS POR TÓPICO (DEPOIS)' as info,
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

-- 6. Verificar se há duplicados
SELECT 
  'VERIFICAÇÃO DE DUPLICADOS' as info,
  COUNT(*) as duplicados
FROM (
  SELECT topic_id, question, answer, COUNT(*) as quantidade
  FROM public.flashcards
  WHERE topic_id IN (
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
  GROUP BY topic_id, question, answer
  HAVING COUNT(*) > 1
) as duplicados;

-- 7. Resumo final por tipo de regulamento
SELECT 
  'RESUMO FINAL POR TIPO' as info,
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