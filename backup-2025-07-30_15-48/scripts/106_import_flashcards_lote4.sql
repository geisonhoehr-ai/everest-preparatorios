-- Script para importar quarto lote de flashcards (25 flashcards)
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

-- 2. Importar os 25 flashcards
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

-- 3. Verificar status após a importação
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

-- 4. Verificar flashcards por tópico
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