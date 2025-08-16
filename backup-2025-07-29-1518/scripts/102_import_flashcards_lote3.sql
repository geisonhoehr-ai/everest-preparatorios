-- Script para importar terceiro lote de flashcards gerados pela IA
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
      "id": 71,
      "pergunta": "Quais são os tipos de atas regulamentados pela ICA 111-3?",
      "resposta": "São atas ordinárias, extraordinárias, de reuniões técnicas e administrativas, conforme a finalidade do registro.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 5º"
    },
    {
      "id": 72,
      "pergunta": "Segundo a ICA 111-3, qual a importância do controle de frequência às reuniões?",
      "resposta": "O controle de frequência garante o registro da presença dos participantes e a validade das decisões tomadas.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 10"
    },
    {
      "id": 73,
      "pergunta": "O que deve constar obrigatoriamente nas atas de reuniões da FAB segundo a ICA 111-3?",
      "resposta": "A lista de presença, a pauta, o desenvolvimento dos trabalhos, as deliberações e as assinaturas dos participantes.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 12"
    },
    {
      "id": 74,
      "pergunta": "Como deve ser feita a retificação de uma ata conforme a ICA 111-3?",
      "resposta": "A retificação deve ser feita em novo parágrafo na mesma ata, devidamente datada, avalizada e assinada pelos presentes.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 18"
    },
    {
      "id": 75,
      "pergunta": "O que caracteriza uma reunião extraordinária segundo a ICA 111-3?",
      "resposta": "É aquela convocada fora do calendário previsto para tratar de assuntos urgentes e relevantes.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 20"
    },
    {
      "id": 76,
      "pergunta": "Segundo a ICA 111-3, quem pode lavrar uma ata de reunião?",
      "resposta": "Qualquer militar designado ou servidor, preferencialmente com conhecimento do assunto tratado.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 7º"
    },
    {
      "id": 77,
      "pergunta": "O que é vedado em uma ata de reunião, conforme a ICA 111-3?",
      "resposta": "Registros subjetivos, opiniões pessoais e alterações não autorizadas no texto original.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 13"
    },
    {
      "id": 78,
      "pergunta": "A quem compete aprovar o texto final de uma ata segundo a ICA 111-3?",
      "resposta": "Ao presidente da reunião ou autoridade indicada no regulamento interno.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 15"
    },
    {
      "id": 79,
      "pergunta": "Segundo a ICA 111-3, como deve ser arquivada a ata de reunião?",
      "resposta": "Em pasta própria e, se possível, digitalizada para facilitar a busca e segurança da informação.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 22"
    },
    {
      "id": 80,
      "pergunta": "O que acontece se um militar se recusar a assinar a ata?",
      "resposta": "Deve-se registrar a recusa, relatando o fato na própria ata, assinada pelos demais participantes.",
      "topico": "ICA 111-3",
      "tipo": "FAB",
      "referencia": "ICA 111-3, art. 16"
    },
    {
      "id": 81,
      "pergunta": "Qual é o objetivo da ICA 111-6 no âmbito da FAB?",
      "resposta": "Estabelecer normas sobre correspondência militar eletrônica e segurança da informação.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 1º"
    },
    {
      "id": 82,
      "pergunta": "O que caracteriza correspondência sigilosa segundo a ICA 111-6?",
      "resposta": "Aquela que contém informações restritas, devendo ser protegida contra divulgação não autorizada.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 8º"
    },
    {
      "id": 83,
      "pergunta": "Como devem ser classificados os documentos conforme a ICA 111-6?",
      "resposta": "Conforme grau de sigilo: ostensivo, reservado, secreto e ultrassecreto.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 5º"
    },
    {
      "id": 84,
      "pergunta": "O que é exigido para acesso a documentos classificados como \"secreto\" na FAB?",
      "resposta": "Autorização expressa da autoridade competente e necessidade do serviço.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 10"
    },
    {
      "id": 85,
      "pergunta": "Segundo a ICA 111-6, o que deve constar obrigatoriamente em correspondências eletrônicas oficiais?",
      "resposta": "Assunto, identificação do remetente e do destinatário, grau de sigilo e data do envio.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 12"
    },
    {
      "id": 86,
      "pergunta": "O que é vedado em correspondências eletrônicas militares segundo a ICA 111-6?",
      "resposta": "Envio de informações pessoais, piadas, correntes ou material alheio ao serviço.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 15"
    },
    {
      "id": 87,
      "pergunta": "O que orienta a ICA 111-6 quanto a backups de documentos eletrônicos?",
      "resposta": "A realização periódica e a guarda em local seguro considerando a criticidade dos dados.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 20"
    },
    {
      "id": 88,
      "pergunta": "Quem responde por vazamento de informação sigilosa segundo a ICA 111-6?",
      "resposta": "O militar responsável pelo envio ou guarda sem observar as normas de segurança.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 18"
    },
    {
      "id": 89,
      "pergunta": "De acordo com ICA 111-6, qual é o procedimento em caso de falha de segurança da informação?",
      "resposta": "Comunicação imediata à autoridade competente e adoção de medidas para contenção e apuração.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 21"
    },
    {
      "id": 90,
      "pergunta": "Segundo a ICA 111-6, como deve ser o tratamento de arquivos digitais obsoletos?",
      "resposta": "Devem ser eliminados conforme normas internas, garantindo a impossibilidade de recuperação das informações.",
      "topico": "ICA 111-6",
      "tipo": "FAB",
      "referencia": "ICA 111-6, art. 23"
    },
    {
      "id": 91,
      "pergunta": "Quais são as garantias fundamentais do militar previstas na Lei nº 6.880/1980?",
      "resposta": "São: estabilidade, remuneração adequada, atendimento médico, férias, entre outros direitos previstos em lei.",
      "topico": "Lei nº 6.880/1980",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 50"
    },
    {
      "id": 92,
      "pergunta": "O que é o conceito de estabilidade para o militar na Lei nº 6.880/1980?",
      "resposta": "É o direito do militar de permanecer na carreira após certo tempo de serviço, salvo nos casos previstos em lei.",
      "topico": "Lei nº 6.880/1980",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 51"
    },
    {
      "id": 93,
      "pergunta": "O que define a promoção de militar conforme Lei nº 6.880/1980?",
      "resposta": "É o ato de ascensão a posta ou graduação superior dentro da hierarquia.",
      "topico": "Lei nº 6.880/1980",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 57"
    },
    {
      "id": 94,
      "pergunta": "Quando se dá a exclusão do militar das Forças Armadas segundo Lei nº 6.880/1980?",
      "resposta": "Quando ocorre licenciamento, reforma, transferência para a reserva ou demissão, conforme a legislação.",
      "topico": "Lei nº 6.880/1980",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 94"
    },
    {
      "id": 95,
      "pergunta": "Segundo a Lei nº 6.880/1980, quais são os deveres fundamentais do militar?",
      "resposta": "Fidelidade à pátria, disciplina, respeito à hierarquia, honestidade, entre outros estabelecidos por lei.",
      "topico": "Lei nº 6.880/1980",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 28"
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
      WHEN value->>'topico' LIKE '%Estatuto%' OR value->>'topico' LIKE '%Lei nº 6.880%' THEN 'estatuto-militares'
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
  ('ica-111-3', 'Quais são os tipos de atas regulamentados pela ICA 111-3?', 'São atas ordinárias, extraordinárias, de reuniões técnicas e administrativas, conforme a finalidade do registro.'),
  ('ica-111-3', 'Segundo a ICA 111-3, qual a importância do controle de frequência às reuniões?', 'O controle de frequência garante o registro da presença dos participantes e a validade das decisões tomadas.'),
  ('ica-111-3', 'O que deve constar obrigatoriamente nas atas de reuniões da FAB segundo a ICA 111-3?', 'A lista de presença, a pauta, o desenvolvimento dos trabalhos, as deliberações e as assinaturas dos participantes.'),
  ('ica-111-3', 'Como deve ser feita a retificação de uma ata conforme a ICA 111-3?', 'A retificação deve ser feita em novo parágrafo na mesma ata, devidamente datada, avalizada e assinada pelos presentes.'),
  ('ica-111-3', 'O que caracteriza uma reunião extraordinária segundo a ICA 111-3?', 'É aquela convocada fora do calendário previsto para tratar de assuntos urgentes e relevantes.'),
  ('ica-111-3', 'Segundo a ICA 111-3, quem pode lavrar uma ata de reunião?', 'Qualquer militar designado ou servidor, preferencialmente com conhecimento do assunto tratado.'),
  ('ica-111-3', 'O que é vedado em uma ata de reunião, conforme a ICA 111-3?', 'Registros subjetivos, opiniões pessoais e alterações não autorizadas no texto original.'),
  ('ica-111-3', 'A quem compete aprovar o texto final de uma ata segundo a ICA 111-3?', 'Ao presidente da reunião ou autoridade indicada no regulamento interno.'),
  ('ica-111-3', 'Segundo a ICA 111-3, como deve ser arquivada a ata de reunião?', 'Em pasta própria e, se possível, digitalizada para facilitar a busca e segurança da informação.'),
  ('ica-111-3', 'O que acontece se um militar se recusar a assinar a ata?', 'Deve-se registrar a recusa, relatando o fato na própria ata, assinada pelos demais participantes.'),
  ('ica-111-6', 'Qual é o objetivo da ICA 111-6 no âmbito da FAB?', 'Estabelecer normas sobre correspondência militar eletrônica e segurança da informação.'),
  ('ica-111-6', 'O que caracteriza correspondência sigilosa segundo a ICA 111-6?', 'Aquela que contém informações restritas, devendo ser protegida contra divulgação não autorizada.'),
  ('ica-111-6', 'Como devem ser classificados os documentos conforme a ICA 111-6?', 'Conforme grau de sigilo: ostensivo, reservado, secreto e ultrassecreto.'),
  ('ica-111-6', 'O que é exigido para acesso a documentos classificados como "secreto" na FAB?', 'Autorização expressa da autoridade competente e necessidade do serviço.'),
  ('ica-111-6', 'Segundo a ICA 111-6, o que deve constar obrigatoriamente em correspondências eletrônicas oficiais?', 'Assunto, identificação do remetente e do destinatário, grau de sigilo e data do envio.'),
  ('ica-111-6', 'O que é vedado em correspondências eletrônicas militares segundo a ICA 111-6?', 'Envio de informações pessoais, piadas, correntes ou material alheio ao serviço.'),
  ('ica-111-6', 'O que orienta a ICA 111-6 quanto a backups de documentos eletrônicos?', 'A realização periódica e a guarda em local seguro considerando a criticidade dos dados.'),
  ('ica-111-6', 'Quem responde por vazamento de informação sigilosa segundo a ICA 111-6?', 'O militar responsável pelo envio ou guarda sem observar as normas de segurança.'),
  ('ica-111-6', 'De acordo com ICA 111-6, qual é o procedimento em caso de falha de segurança da informação?', 'Comunicação imediata à autoridade competente e adoção de medidas para contenção e apuração.'),
  ('ica-111-6', 'Segundo a ICA 111-6, como deve ser o tratamento de arquivos digitais obsoletos?', 'Devem ser eliminados conforme normas internas, garantindo a impossibilidade de recuperação das informações.'),
  ('estatuto-militares', 'Quais são as garantias fundamentais do militar previstas na Lei nº 6.880/1980?', 'São: estabilidade, remuneração adequada, atendimento médico, férias, entre outros direitos previstos em lei.'),
  ('estatuto-militares', 'O que é o conceito de estabilidade para o militar na Lei nº 6.880/1980?', 'É o direito do militar de permanecer na carreira após certo tempo de serviço, salvo nos casos previstos em lei.'),
  ('estatuto-militares', 'O que define a promoção de militar conforme Lei nº 6.880/1980?', 'É o ato de ascensão a posta ou graduação superior dentro da hierarquia.'),
  ('estatuto-militares', 'Quando se dá a exclusão do militar das Forças Armadas segundo Lei nº 6.880/1980?', 'Quando ocorre licenciamento, reforma, transferência para a reserva ou demissão, conforme a legislação.'),
  ('estatuto-militares', 'Segundo a Lei nº 6.880/1980, quais são os deveres fundamentais do militar?', 'Fidelidade à pátria, disciplina, respeito à hierarquia, honestidade, entre outros estabelecidos por lei.');
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