-- Script para importar sexto lote de flashcards (35 flashcards)
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

-- 2. Importar os 35 flashcards
INSERT INTO public.flashcards (topic_id, question, answer) VALUES 
  ('rdaer', 'Segundo o RDAer, quais são os direitos garantidos ao militar processado administrativamente?', 'Direito à ampla defesa, ao contraditório, ao acompanhamento por defensor e à ciência de todas as decisões.'),
  ('rdaer', 'O que prevê o RDAer quanto à suspensão preventiva do militar?', 'A suspensão preventiva pode ser decretada para a garantia da ordem ou conveniência da instrução disciplinar, pelo prazo que a lei específica determinar.'),
  ('rdaer', 'Qual é a diferença, segundo o RDAer, entre advertência verbal e repreensão?', 'Advertência verbal é uma censura reservada. A repreensão é mais grave, lançada por escrito e com registro em assentamento.'),
  ('rdaer', 'Como ocorre o julgamento de recursos disciplinares no âmbito FAB, conforme o RDAer?', 'O recurso deve ser julgado pelo superior imediato à autoridade que aplicou a sanção disciplinar.'),
  ('rdaer', 'O que é reincidência disciplinar segundo o RDAer?', 'A nova infração cometida antes de transcorrido 1 ano do cumprimento total da punição anterior de igual natureza.'),
  ('rdaer', 'A quem compete aprovar regulamentos internos das Organizações Militares Aeronáuticas, conforme RDAer?', 'Ao Comandante da Aeronáutica ou autoridade superior designada.'),
  ('ica-111-6', 'Segundo a ICA 111-6, como se define documento sigiloso?', 'Documento que contém informações cujo conhecimento deve ser restrito, conforme regras de segurança institucional.'),
  ('ica-111-6', 'Qual o prazo para reclassificação de documentos sigilosos na FAB, conforme ICA 111-6?', 'Reclassificação pode ocorrer a qualquer tempo, a critério da autoridade responsável, mediante formalização.'),
  ('ica-111-6', 'Como deve ser feita a guarda de documentos confidenciais, conforme ICA 111-6?', 'Obrigatoriamente em local apropriado, com controle de acesso, conforme orientação normativa específica.'),
  ('ica-111-6', 'De acordo com a ICA 111-6, como se dá a comunicação interna com informações sigilosas?', 'Deve seguir os procedimentos de tramitação segura e registro restrito, conforme classificação do documento.'),
  ('ica-111-6', 'Quando um documento deixa de ser sigiloso segundo ICA 111-6?', 'Com o decurso do prazo de sigilo, reclassificação expressa ou decisão da autoridade competente.'),
  ('ica-111-3', 'O que é procedimento administrativo sumaríssimo conforme ICA 111-3?', 'Procedimento simplificado destinado a apurar fatos de menor complexidade com tramitação breve.'),
  ('ica-111-3', 'Segundo ICA 111-3, quando se utiliza ata sucinta?', 'Quando as matérias tratadas forem corriqueiras ou previamente analisadas, dispensando descrições detalhadas.'),
  ('ica-111-3', 'Quais registros obrigatórios em ata previstos na ICA 111-3?', 'Data, hora de início e término, membros presentes, temas tratados e eventuais deliberações.'),
  ('ica-111-3', 'Como é feita a ratificação de ata conforme ICA 111-3?', 'Pela assinatura dos membros presentes, podendo haver ressalva de discordância fundamentada.'),
  ('ica-111-3', 'Quando se usa ata circunstanciada segundo ICA 111-3?', 'Em eventos ou reuniões que envolvam situações excepcionais, decisões de grande impacto ou fatos relevantes.'),
  ('rca-34-1', 'O que versa o art. 34 do RCA 34-1?', 'Dispõe sobre os procedimentos para recebimento e entrega de cargo no âmbito das forças armadas.'),
  ('rca-34-1', 'O que define o art. 10 do RCA 34-1 sobre o uso de uniformes?', 'Estabelece que o uso do uniforme é obrigatório em serviço ativo, conforme normas de apresentação individual.'),
  ('rca-34-1', 'Como se caracteriza abandono de posto conforme RCA 34-1?', 'Quando o militar se afasta deliberadamente de seu posto, função ou posição sem autorização.'),
  ('rca-34-1', 'Segundo o RCA 34-1, quem deve portar identificação oficial em serviço?', 'Todo militar em serviço deve portar identificação oficial, podendo ser exigida pelas autoridades competentes.'),
  ('rca-34-1', 'Qual a obrigação do militar quanto à comunicação de mudança de endereço, conforme RCA 34-1?', 'É obrigação comunicar imediatamente à organização militar toda alteração de endereço residencial.'),
  ('rca-34-1', 'De acordo com RCA 34-1, o que é permitido durante cerimônias militares quanto ao uso de acessórios pessoais?', 'É permitido apenas o uso de acessórios previstos e discretos, vedando exageros e itens que prejudiquem a apresentação pessoal.'),
  ('rca-34-1', 'Qual é a definição de "moral militar" de acordo com RCA 34-1?', 'É o conjunto de valores éticos e princípios de honra que norteiam o comportamento do militar.'),
  ('estatuto-militares', 'Qual é a medida disciplinar cabível para ausência injustificada ao serviço, segundo a Lei nº 6.880/1980?', 'Advertência, suspensão ou outra medida, conforme a gravidade e reincidência do ato.'),
  ('estatuto-militares', 'Segundo a Lei nº 6.880/1980, o que se entende por estabilidade no serviço militar?', 'É o direito adquirido do militar que presta serviços sem reprovação ou punição grave por determinado tempo.'),
  ('estatuto-militares', 'Quando o militar pode ser agregado segundo a Lei nº 6.880/1980?', 'Quando afastado temporariamente do serviço ativo, sem perda da situação de militar, por motivos previstos em lei.'),
  ('estatuto-militares', 'Em que situações ocorre o licenciamento ex officio, conforme a Lei nº 6.880/1980?', 'Quando o militar perde requisitos legais essenciais, por interesse da administração ou por decisão judicial.'),
  ('estatuto-militares', 'Como se comprova a assiduidade do militar para fins de promoção, conforme Lei nº 6.880/1980?', 'Por registros administrativos de frequência, elogios e ausência de punições disciplinares.'),
  ('ica-111-2', 'No âmbito da ICA 111-2, qual é a prioridade para tratamento de comunicações urgentes?', 'Deve-se registrar, tramitar e concluir prioritariamente, garantindo resposta no menor prazo possível.'),
  ('ica-111-2', 'Qual o procedimento para arquivamento de documentos recebidos eletronicamente segundo ICA 111-2?', 'Os documentos devem ser impressos, autenticados quanto à origem, e inseridos no sistema de arquivos da OM.'),
  ('ica-111-2', 'O que prevê a ICA 111-2 sobre prazos de resposta para ofícios externos?', 'O prazo é estabelecido em ordem da autoridade superior ou, na ausência, em até 5 dias úteis.'),
  ('ica-111-2', 'Segundo ICA 111-2, as comunicações internas podem ser enviadas por e-mail institucional?', 'Sim, desde que observados os procedimentos de segurança da informação e autenticidade.'),
  ('ica-111-2', 'Como se determina o tipo de protocolo utilizado em comunicações segundo ICA 111-2?', 'Depende do grau de sigilo, da urgência e do assunto a ser tratado, conforme normas internas.'),
  ('ica-111-2', 'O que regula o uso da assinatura digital na FAB conforme ICA 111-2?', 'O uso da assinatura digital deve obedecer à legislação específica, garantindo autenticidade e integridade dos documentos.'),
  ('ica-111-2', 'Em que casos a tramitação de documentos físicos ainda é obrigatória segundo ICA 111-2?', 'Quando se tratar de documentos originais, de valor legal ou exigidos por normas específicas.');

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