-- Script para importar quinto lote de flashcards (45 flashcards)
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

-- 2. Importar os 45 flashcards
INSERT INTO public.flashcards (topic_id, question, answer) VALUES 
  ('estatuto-militares', 'O que caracteriza transgressão disciplinar segundo a Lei nº 6.880/1980?', 'Qualquer ato cometido contra a disciplina militar, como desobediência, abuso de autoridade, ou negligência no serviço.'),
  ('estatuto-militares', 'Qual é a finalidade dos Códigos de Ética Militar previstos na Lei nº 6.880/1980?', 'Definir valores, princípios e condutas adequadas dos militares para fortalecimento da instituição.'),
  ('estatuto-militares', 'Segundo a Lei nº 6.880/1980, o que caracteriza abandono de posto?', 'Quando o militar deixa o posto ou serviço sem autorização, colocando em risco a disciplina.'),
  ('estatuto-militares', 'O que é vedado ao militar, conforme a Lei nº 6.880/1980, em relação a atividade político-partidária?', 'Militar da ativa não pode estar filiado a partido político.'),
  ('estatuto-militares', 'Segundo a Lei nº 6.880/1980, o que ocorre com o militar reformado?', 'O militar reformado é aquele transferido definitivamente para a inatividade por limite de idade, incapacidade ou tempo de serviço.'),
  ('lei-13954-2019', 'O que prevê a Lei nº 13.954/2019 sobre a proteção social dos militares das Forças Armadas?', 'Estabelece regras de proteção social, direitos de pensão, auxílio invalidez, entre outros benefícios.'),
  ('lei-13954-2019', 'Quem tem direito à pensão militar segundo a Lei 13.954/2019?', 'Cônjuges, companheiros e dependentes previstos em lei.'),
  ('portaria-gm-md-1143-2022', 'Qual a função da Portaria GM-MD 1.143/2022?', 'Ela dispõe sobre procedimentos administrativos disciplinares e instauração de sindicâncias e processos nos comandos militares.'),
  ('portaria-gm-md-1143-2022', 'Quais são as fases do processo disciplinar segundo a Portaria GM-MD 1.143/2022?', 'Instauração, instrução, julgamento e comunicação da decisão.'),
  ('portaria-gm-md-1143-2022', 'De acordo com a Portaria GM-MD 1.143/2022, quem pode instaurar processo disciplinar?', 'A autoridade competente indicada nos regulamentos internos das Forças Armadas.'),
  ('portaria-gm-md-1143-2022', 'Segundo a Portaria GM-MD 1.143/2022, o que é sindicância administrativa?', 'É o procedimento investigativo para apurar fatos e responsabilidades no âmbito disciplinar militar.'),
  ('portaria-gm-md-1143-2022', 'O que determina a Portaria GM-MD 1.143/2022 em relação à ampla defesa em processos disciplinares?', 'Garante ao acusado direito a ampla defesa e contraditório durante todo o processo.'),
  ('portaria-gm-md-1143-2022', 'Conforme a Portaria GM-MD 1.143/2022, o que é defesa prévia?', 'É a primeira manifestação escrita do acusado nos autos do processo, antes da instrução.'),
  ('portaria-gm-md-1143-2022', 'De acordo com a Portaria GM-MD 1.143/2022, o que ocorre após o julgamento disciplinar?', 'A decisão é comunicada ao acusado e adotadas as providências cabíveis quanto às sanções.'),
  ('rdaer', 'Segundo o RDAer, quais são os princípios basilares da estrutura militar da Aeronáutica?', 'Hierarquia e disciplina são considerados princípios essenciais.'),
  ('rdaer', 'Conforme o RDAer, o que é considerado autoridade militar?', 'É o poder conferido ao militar pelo cargo ocupado, para fins de direção, comando e chefia.'),
  ('rdaer', 'O que determina o RDAer acerca dos atos de serviço?', 'Devem ser exercidos dentro dos limites da lei, dos regulamentos e das ordens das autoridades competentes.'),
  ('rdaer', 'De acordo com o RDAer, quais são as obrigações do militar quanto à autoridade superior?', 'Obedecer às ordens legais e respeitar o superior hierárquico em todas as circunstâncias.'),
  ('rdaer', 'O que dispõe o RDAer sobre punições disciplinares?', 'Punições devem ser aplicadas na medida da gravidade, sempre buscando correção e disciplina.'),
  ('rdaer', 'Segundo o RDAer, é possível recurso hierárquico contra decisões disciplinares?', 'Sim, o militar pode requerer revisão e recurso em graus superiores de comando.'),
  ('rdaer', 'Conforme o RDAer, o que é insubordinação?', 'É qualquer ato que atente contra a disciplina, a hierarquia ou a autoridade militar legalmente constituída.'),
  ('ica-111-1', 'Segundo a ICA 111-1, qual o objetivo principal do documento militar?', 'Formalizar informações, decisões, ordens e registros oficiais no âmbito da Aeronáutica.'),
  ('ica-111-1', 'De acordo com a ICA 111-1, o que são documentos normativos?', 'São aqueles que estabelecem regras e procedimentos obrigatórios no âmbito da FAB.'),
  ('ica-111-1', 'Segundo a ICA 111-1, quais são os tipos de classificação de documentos militares?', 'Sigiloso, reservado, oficial e ostensivo.'),
  ('ica-111-1', 'Quais são os principais tipos de documentos administrativos da Aeronáutica, segundo a ICA 111-1?', 'Incluem ofício, memorando, requerimento, ata, portaria, e ordem de serviço.'),
  ('ica-111-1', 'Segundo a ICA 111-1, qual a responsabilidade do militar em relação aos documentos sob sua guarda?', 'Manter sigilo, zelar pelo bom estado e garantir que sejam utilizados adequadamente.'),
  ('ica-111-2', 'Na ICA 111-2, qual a diferença entre ofício e memorando?', 'Ofício destina-se à comunicação entre autoridades de diferentes órgãos e o memorando, entre setores de um mesmo órgão.'),
  ('ica-111-2', 'Segundo a ICA 111-2, qual deve ser a estrutura padrão de um documento oficial?', 'Cabeçalho, texto principal, fecho e assinatura.'),
  ('ica-111-2', 'O que prevê a ICA 111-2 sobre padronização de comunicações oficiais?', 'Exige adoção de estrutura, linguagem e formatação padronizadas, visando clareza, concisão e formalismo.'),
  ('ica-111-2', 'Conforme a ICA 111-2, qual é o prazo recomendado para resposta a documentos oficiais?', 'O prazo deve ser estabelecido em cada documento, geralmente até 5 dias úteis.'),
  ('ica-111-2', 'Segundo a ICA 111-2, quem é responsável pela conferência das informações e anexos em documentos oficiais?', 'A autoridade emitente e o setor responsável pela expedição do documento.'),
  ('ica-111-2', 'Conforme a ICA 111-2, quando o uso do protocolo de recebimento é obrigatório?', 'Sempre que envolver tramitação de documentos oficiais entre setores ou organizações diferentes.'),
  ('ica-111-2', 'O que prevê a ICA 111-2 sobre correio eletrônico?', 'Sua utilização é permitida para comunicações oficiais, desde que observadas as normas de segurança.'),
  ('ica-111-3', 'O que disciplina a ICA 111-3 quanto à elaboração de atas na Aeronáutica?', 'As atas devem conter data, local, lista de presentes, pauta, deliberações e assinaturas ao final.'),
  ('ica-111-3', 'Qual a periodicidade ideal das reuniões administrativas segundo a ICA 111-3?', 'Recomenda-se reuniões administrativas ordinárias mensais e extraordinárias quando necessário.'),
  ('ica-111-3', 'De acordo com a ICA 111-3, quem deve lavrar a ata das reuniões?', 'O secretário designado ou pessoa estabelecida em ato administrativo.'),
  ('ica-111-3', 'Segundo a ICA 111-3, a ata pode ser lavrada posteriormente à reunião?', 'Sim, desde que seja assinada pelos presentes ou por quem a presidiu.'),
  ('ica-111-3', 'Quais são os requisitos mínimos para o controle de atas, conforme a ICA 111-3?', 'Deve haver numeração sequencial, livro de registro e arquivamento seguro.'),
  ('ica-111-6', 'Segundo a ICA 111-6, qual o objetivo do protocolo de documentos?', 'Registrar, controlar e garantir o fluxo eficiente de documentos oficiais na Aeronáutica.'),
  ('ica-111-6', 'Conforme a ICA 111-6, como deve ser feita a classificação dos documentos recebidos?', 'De acordo com o assunto, grau de sigilo e remetente para facilitar tramitação e arquivamento.'),
  ('ica-111-6', 'O que prevê a ICA 111-6 sobre o uso de sistemas eletrônicos para protocolo de documentos?', 'Possibilita o uso de sistemas informatizados para registro e controle, garantindo segurança e rastreabilidade.'),
  ('ica-111-6', 'De acordo com a ICA 111-6, quem é responsável pelo protocolo?', 'A seção de protocolo da organização militar ou unidade responsável.'),
  ('ica-111-6', 'Segundo a ICA 111-6, qual deve ser o tratamento para documentos com informações sigilosas?', 'Devem ser registrados, tramitados e arquivados separadamente, garantindo confidencialidade máxima.'),
  ('ica-111-6', 'Segundo a ICA 111-6, o que deve ser feito com documentos eletrônicos de natureza disciplinar?', 'Devem ser tratados com o mesmo rigor de sigilo e protocolo dos documentos físicos convencionais.'),
  ('ica-111-6', 'O que determina a ICA 111-6 sobre o descarte de documentos?', 'O descarte somente pode ocorrer após avaliação, atendimento da legislação vigente e lavratura de termo.');

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