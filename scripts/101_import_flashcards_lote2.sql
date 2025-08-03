-- Script para importar segundo lote de flashcards gerados pela IA
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
      "pergunta": "Quais são os pilares fundamentais da estrutura militar segundo o Estatuto dos Militares?",
      "resposta": "Os pilares são a hierarquia e a disciplina, considerados indispensáveis à estrutura das Forças Armadas.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 12"
    },
    {
      "id": 4,
      "pergunta": "O que significa antiguidade para efeito de promoção?",
      "resposta": "Antiguidade é a posição relativa entre militares da mesma graduação, contando-se o tempo de serviço na respectiva graduação.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 16"
    },
    {
      "id": 5,
      "pergunta": "Como a estabilidade é alcançada pelos militares, segundo a lei?",
      "resposta": "A estabilidade é adquirida após 10 anos de efetivo serviço, resguardada por mecanismos legais.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 50"
    },
    {
      "id": 6,
      "pergunta": "Quais são as principais obrigações dos militares estabelecidas no Estatuto?",
      "resposta": "As principais obrigações são dedicação integral ao serviço, cumprimento fiel das ordens e manutenção da disciplina e hierarquia.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 21"
    },
    {
      "id": 7,
      "pergunta": "Em quais condições o militar pode ser afastado do serviço ativo?",
      "resposta": "Por motivos de incapacidade física, condenação judicial transitada em julgado, ou a pedido mediante aprovação da autoridade competente.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 94"
    },
    {
      "id": 8,
      "pergunta": "Como é regulamentada a remuneração dos militares?",
      "resposta": "A remuneração é composta de soldo, gratificações, adicionais e indenizações previstas em lei.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 46"
    },
    {
      "id": 9,
      "pergunta": "O que caracteriza um ato de bravura, e como ele influencia a carreira militar?",
      "resposta": "Ato reconhecido mediante avaliação de conduta excepcional, podendo acelerar promoções ou concessão de prêmios.",
      "topico": "Estatuto dos Militares",
      "tipo": "geral",
      "referencia": "Lei nº 6.880/1980, art. 25"
    },
    {
      "id": 10,
      "pergunta": "O que estabelece a Lei nº 13.954/2019 sobre a proteção social dos militares?",
      "resposta": "Define regras de inatividade, pensão, benefícios e manutenção da proteção social própria dos militares.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24"
    },
    {
      "id": 11,
      "pergunta": "Como funciona a contribuição previdenciária do militar ativo?",
      "resposta": "O militar ativo contribui com percentual fixado sobre a remuneração, destinado ao sistema de proteção social.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24-C"
    },
    {
      "id": 12,
      "pergunta": "O que mudou quanto ao tempo de serviço para transferência para a reserva?",
      "resposta": "O tempo mínimo de serviço aumentou, variando de acordo com a data de ingresso e posto/graduação, conforme transição estabelecida.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24-F"
    },
    {
      "id": 13,
      "pergunta": "Filhos maiores podem receber pensão militar após a morte do militar?",
      "resposta": "Não, apenas filhos menores de 21 anos, inválidos ou interditos têm direito à pensão militar.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24-G"
    },
    {
      "id": 14,
      "pergunta": "Como a lei trata a pensão de ex-cônjuge?",
      "resposta": "O ex-cônjuge só recebe pensão se houver determinação judicial específica e for dependente econômico do militar.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24-H"
    },
    {
      "id": 15,
      "pergunta": "Militares inativos também contribuem para o sistema de proteção social?",
      "resposta": "Sim, em situações previstas em lei, como quando a remuneração é superior ao teto do INSS.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24-D"
    },
    {
      "id": 16,
      "pergunta": "O que é previsto para pensão de dependentes de militares desaparecidos em atividade de serviço?",
      "resposta": "Os dependentes tornam-se beneficiários de pensão militar como se declarado falecido o militar.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24-J"
    },
    {
      "id": 17,
      "pergunta": "Qual é regra para reversão de pensão militar?",
      "resposta": "Ocorrerá reversão em favor de outros dependentes na ausência do beneficiário original ou pelo término do benefício.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24-K"
    },
    {
      "id": 18,
      "pergunta": "O militar da ativa pode acumular com benefício previdenciário civil?",
      "resposta": "Até o valor do salário-mínimo, desde que respeitadas as regras do regime próprio do militar.",
      "topico": "Lei 13.954/2019",
      "tipo": "geral",
      "referencia": "Lei 13.954/2019, art. 24-L"
    },
    {
      "id": 19,
      "pergunta": "Quais os princípios do Regulamento Disciplinar do Exército?",
      "resposta": "Subordinação à autoridade, lealdade, respeito, zelo pelo patrimônio público e cumprimento do dever.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 7º"
    },
    {
      "id": 20,
      "pergunta": "Quais são as principais punições disciplinares previstas no RDE?",
      "resposta": "Advertência, impedimento disciplinar, detenção disciplinar, prisão disciplinar, licenciamento e exclusão a bem da disciplina.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 15"
    },
    {
      "id": 21,
      "pergunta": "O que é considerada uma transgressão disciplinar pelo RDE?",
      "resposta": "Qualquer infração dos preceitos da ética militar ou descumprimento de normas e regulamentos.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 10"
    },
    {
      "id": 22,
      "pergunta": "Como se diferenciam penas disciplinares e penais no contexto militar?",
      "resposta": "As penas disciplinares aplicam-se por infrações administrativas; penais, por crimes militares, conforme legislação específica.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 11"
    },
    {
      "id": 23,
      "pergunta": "Quais direitos tem o militar submetido a sanção disciplinar?",
      "resposta": "Direito à ampla defesa, contraditório, ser ouvido por autoridade competente e recorrer da decisão.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 28"
    },
    {
      "id": 24,
      "pergunta": "A quem compete instaurar sindicância e processos administrativos disciplinares no Exército?",
      "resposta": "Às autoridades imediatamente superiores, conforme cadeia hierárquica.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 19"
    },
    {
      "id": 25,
      "pergunta": "O que diz o RDE sobre reincidência em transgressões disciplinares?",
      "resposta": "A reincidência agrava a pena e pode motivar exclusão a bem da disciplina.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 52"
    },
    {
      "id": 26,
      "pergunta": "Existe prazo para prescrição das transgressões disciplinares?",
      "resposta": "Sim, as transgressões prescrevem em prazos fixados no regulamento de acordo com sua gravidade.",
      "topico": "Regulamento Disciplinar do Exército (RDE)",
      "tipo": "geral",
      "referencia": "RDE, art. 54"
    },
    {
      "id": 27,
      "pergunta": "O que a Portaria GM-MD 1.143/2022 estabelece sobre assiduidade?",
      "resposta": "A assiduidade é de fundamental importância e o descumprimento pode configurar transgressão disciplinar.",
      "topico": "Portaria GM-MD 1.143/2022",
      "tipo": "geral",
      "referencia": "Portaria GM-MD 1.143/2022, art. 2º"
    },
    {
      "id": 28,
      "pergunta": "Quais são as diretrizes para comunicação interna estabelecidas pela Portaria GM-MD 1.143/2022?",
      "resposta": "Devem ser respeitadas normas quanto à hierarquia, clareza, objetividade e confidencialidade.",
      "topico": "Portaria GM-MD 1.143/2022",
      "tipo": "geral",
      "referencia": "Portaria GM-MD 1.143/2022, art. 12"
    },
    {
      "id": 29,
      "pergunta": "Como a portaria trata as rotinas administrativas?",
      "resposta": "Orienta a padronização, transparência e eficiência dos processos internos das Forças Armadas.",
      "topico": "Portaria GM-MD 1.143/2022",
      "tipo": "geral",
      "referencia": "Portaria GM-MD 1.143/2022, art. 7º"
    },
    {
      "id": 30,
      "pergunta": "O que diz a Portaria GM-MD 1.143/2022 sobre o uso de uniforme?",
      "resposta": "Impõe o uso regulamentado, em conformidade com normas específicas de cada Força, primando pela apresentação pessoal adequada.",
      "topico": "Portaria GM-MD 1.143/2022",
      "tipo": "geral",
      "referencia": "Portaria GM-MD 1.143/2022, art. 18"
    },
    {
      "id": 31,
      "pergunta": "Como a portaria regulamenta o uso de meios eletrônicos para comunicação oficial?",
      "resposta": "Exige confidencialidade, autenticidade e uso autorizado da cadeia de comando.",
      "topico": "Portaria GM-MD 1.143/2022",
      "tipo": "geral",
      "referencia": "Portaria GM-MD 1.143/2022, art. 15"
    },
    {
      "id": 32,
      "pergunta": "Em que casos pode ser determinada investigação sumária?",
      "resposta": "Quando os fatos forem de menor complexidade e não necessitarem de apuração aprofundada.",
      "topico": "Portaria GM-MD 1.143/2022",
      "tipo": "geral",
      "referencia": "Portaria GM-MD 1.143/2022, art. 22"
    },
    {
      "id": 33,
      "pergunta": "O que trata o RCA 34-1 sobre continências?",
      "resposta": "Normatiza a execução das continências, sinais de respeito e honras militares entre militares e autoridades.",
      "topico": "RCA 34-1",
      "tipo": "geral",
      "referencia": "RCA 34-1, art. 5º"
    },
    {
      "id": 34,
      "pergunta": "Quais são as formas de continência previstas pelo RCA 34-1?",
      "resposta": "Continência individual, coletiva e continências prestadas a símbolos nacionais.",
      "topico": "RCA 34-1",
      "tipo": "geral",
      "referencia": "RCA 34-1, art. 9º"
    },
    {
      "id": 35,
      "pergunta": "Quando a continência é dispensada de acordo com o RCA 34-1?",
      "resposta": "É dispensada em instruções militares, atividades de campanha, trabalhos manuais e atividades esportivas.",
      "topico": "RCA 34-1",
      "tipo": "geral",
      "referencia": "RCA 34-1, art. 19"
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
  ('estatuto-militares', 'Quais são os pilares fundamentais da estrutura militar segundo o Estatuto dos Militares?', 'Os pilares são a hierarquia e a disciplina, considerados indispensáveis à estrutura das Forças Armadas.'),
  ('estatuto-militares', 'O que significa antiguidade para efeito de promoção?', 'Antiguidade é a posição relativa entre militares da mesma graduação, contando-se o tempo de serviço na respectiva graduação.'),
  ('estatuto-militares', 'Como a estabilidade é alcançada pelos militares, segundo a lei?', 'A estabilidade é adquirida após 10 anos de efetivo serviço, resguardada por mecanismos legais.'),
  ('estatuto-militares', 'Quais são as principais obrigações dos militares estabelecidas no Estatuto?', 'As principais obrigações são dedicação integral ao serviço, cumprimento fiel das ordens e manutenção da disciplina e hierarquia.'),
  ('estatuto-militares', 'Em quais condições o militar pode ser afastado do serviço ativo?', 'Por motivos de incapacidade física, condenação judicial transitada em julgado, ou a pedido mediante aprovação da autoridade competente.'),
  ('estatuto-militares', 'Como é regulamentada a remuneração dos militares?', 'A remuneração é composta de soldo, gratificações, adicionais e indenizações previstas em lei.'),
  ('estatuto-militares', 'O que caracteriza um ato de bravura, e como ele influencia a carreira militar?', 'Ato reconhecido mediante avaliação de conduta excepcional, podendo acelerar promoções ou concessão de prêmios.'),
  ('lei-13954-2019', 'O que estabelece a Lei nº 13.954/2019 sobre a proteção social dos militares?', 'Define regras de inatividade, pensão, benefícios e manutenção da proteção social própria dos militares.'),
  ('lei-13954-2019', 'Como funciona a contribuição previdenciária do militar ativo?', 'O militar ativo contribui com percentual fixado sobre a remuneração, destinado ao sistema de proteção social.'),
  ('lei-13954-2019', 'O que mudou quanto ao tempo de serviço para transferência para a reserva?', 'O tempo mínimo de serviço aumentou, variando de acordo com a data de ingresso e posto/graduação, conforme transição estabelecida.'),
  ('lei-13954-2019', 'Filhos maiores podem receber pensão militar após a morte do militar?', 'Não, apenas filhos menores de 21 anos, inválidos ou interditos têm direito à pensão militar.'),
  ('lei-13954-2019', 'Como a lei trata a pensão de ex-cônjuge?', 'O ex-cônjuge só recebe pensão se houver determinação judicial específica e for dependente econômico do militar.'),
  ('lei-13954-2019', 'Militares inativos também contribuem para o sistema de proteção social?', 'Sim, em situações previstas em lei, como quando a remuneração é superior ao teto do INSS.'),
  ('lei-13954-2019', 'O que é previsto para pensão de dependentes de militares desaparecidos em atividade de serviço?', 'Os dependentes tornam-se beneficiários de pensão militar como se declarado falecido o militar.'),
  ('lei-13954-2019', 'Qual é regra para reversão de pensão militar?', 'Ocorrerá reversão em favor de outros dependentes na ausência do beneficiário original ou pelo término do benefício.'),
  ('lei-13954-2019', 'O militar da ativa pode acumular com benefício previdenciário civil?', 'Até o valor do salário-mínimo, desde que respeitadas as regras do regime próprio do militar.'),
  ('regulamentos-comuns', 'Quais os princípios do Regulamento Disciplinar do Exército?', 'Subordinação à autoridade, lealdade, respeito, zelo pelo patrimônio público e cumprimento do dever.'),
  ('regulamentos-comuns', 'Quais são as principais punições disciplinares previstas no RDE?', 'Advertência, impedimento disciplinar, detenção disciplinar, prisão disciplinar, licenciamento e exclusão a bem da disciplina.'),
  ('regulamentos-comuns', 'O que é considerada uma transgressão disciplinar pelo RDE?', 'Qualquer infração dos preceitos da ética militar ou descumprimento de normas e regulamentos.'),
  ('regulamentos-comuns', 'Como se diferenciam penas disciplinares e penais no contexto militar?', 'As penas disciplinares aplicam-se por infrações administrativas; penais, por crimes militares, conforme legislação específica.'),
  ('regulamentos-comuns', 'Quais direitos tem o militar submetido a sanção disciplinar?', 'Direito à ampla defesa, contraditório, ser ouvido por autoridade competente e recorrer da decisão.'),
  ('regulamentos-comuns', 'A quem compete instaurar sindicância e processos administrativos disciplinares no Exército?', 'Às autoridades imediatamente superiores, conforme cadeia hierárquica.'),
  ('regulamentos-comuns', 'O que diz o RDE sobre reincidência em transgressões disciplinares?', 'A reincidência agrava a pena e pode motivar exclusão a bem da disciplina.'),
  ('regulamentos-comuns', 'Existe prazo para prescrição das transgressões disciplinares?', 'Sim, as transgressões prescrevem em prazos fixados no regulamento de acordo com sua gravidade.'),
  ('portaria-gm-md-1143-2022', 'O que a Portaria GM-MD 1.143/2022 estabelece sobre assiduidade?', 'A assiduidade é de fundamental importância e o descumprimento pode configurar transgressão disciplinar.'),
  ('portaria-gm-md-1143-2022', 'Quais são as diretrizes para comunicação interna estabelecidas pela Portaria GM-MD 1.143/2022?', 'Devem ser respeitadas normas quanto à hierarquia, clareza, objetividade e confidencialidade.'),
  ('portaria-gm-md-1143-2022', 'Como a portaria trata as rotinas administrativas?', 'Orienta a padronização, transparência e eficiência dos processos internos das Forças Armadas.'),
  ('portaria-gm-md-1143-2022', 'O que diz a Portaria GM-MD 1.143/2022 sobre o uso de uniforme?', 'Impõe o uso regulamentado, em conformidade com normas específicas de cada Força, primando pela apresentação pessoal adequada.'),
  ('portaria-gm-md-1143-2022', 'Como a portaria regulamenta o uso de meios eletrônicos para comunicação oficial?', 'Exige confidencialidade, autenticidade e uso autorizado da cadeia de comando.'),
  ('portaria-gm-md-1143-2022', 'Em que casos pode ser determinada investigação sumária?', 'Quando os fatos forem de menor complexidade e não necessitarem de apuração aprofundada.'),
  ('rca-34-1', 'O que trata o RCA 34-1 sobre continências?', 'Normatiza a execução das continências, sinais de respeito e honras militares entre militares e autoridades.'),
  ('rca-34-1', 'Quais são as formas de continência previstas pelo RCA 34-1?', 'Continência individual, coletiva e continências prestadas a símbolos nacionais.'),
  ('rca-34-1', 'Quando a continência é dispensada de acordo com o RCA 34-1?', 'É dispensada em instruções militares, atividades de campanha, trabalhos manuais e atividades esportivas.');
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