-- Script para importar primeiro lote de flashcards de Português (35 flashcards sobre Concordância)
-- Execute este script no Supabase SQL Editor

-- 1. Verificar status antes da importação
SELECT 
  'STATUS ANTES DA IMPORTAÇÃO' as info,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
FROM public.flashcards f
WHERE f.topic_id IN (
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
);

-- 2. Importar os 35 flashcards sobre Concordância
INSERT INTO public.flashcards (topic_id, question, answer) VALUES 
  ('concordancia', 'O que é a concordância verbal?', 'A concordância verbal é a relação de harmonia entre o verbo e o sujeito, de modo que o verbo deve concordar em número e pessoa com o sujeito da oração.'),
  ('concordancia', 'Como ocorre a concordância do verbo com o sujeito simples?', 'Em um sujeito simples, o verbo concorda em número e pessoa com o núcleo do sujeito, mesmo que haja termos acessórios ligados a ele.'),
  ('concordancia', 'E quando o sujeito vem depois do verbo, a concordância verbal muda?', 'Não, a concordância entre verbo e sujeito permanece. O verbo ainda deve concordar em número e pessoa com o núcleo do sujeito, independente da ordem na frase.'),
  ('concordancia', 'Explique a concordância verbal com sujeito composto.', 'Quando o sujeito é composto, o verbo fica no plural. Se os núcleos do sujeito não estiverem juntos, o verbo concorda com o núcleo mais próximo ou vai para o plural, dependendo do sentido e do contexto.'),
  ('concordancia', 'Como se faz a concordância verbal quando os núcleos do sujeito composto são de pessoas diferentes?', 'Se houver sujeito composto com pessoas diferentes, segue a ordem: 1ª pessoa prevalece sobre 2ª e 3ª; 2ª sobre 3ª. O verbo deve ficar no plural da pessoa que prevalecer.'),
  ('concordancia', 'Quando o verbo "haver" é impessoal, como deve ser feita a concordância?', 'O verbo "haver", quando usado no sentido de existir, é impessoal e deve ser empregado sempre na 3ª pessoa do singular.'),
  ('concordancia', 'Como ocorre a concordância nominal em português?', 'A concordância nominal é a relação de harmonia entre o substantivo e seus determinantes e modificadores, que devem concordar em gênero e número com o substantivo a que se referem.'),
  ('concordancia', 'Dê um exemplo de concordância nominal com adjetivo anteposto a dois ou mais substantivos.', 'O adjetivo anteposto a dois ou mais substantivos concorda com o mais próximo: "Belo quadro e escultura" (mas pode ir para o plural: "Belos quadro e escultura").'),
  ('concordancia', 'Como funciona a concordância de adjetivo posposto a vários substantivos?', 'O adjetivo posposto pode concordar com o substantivo mais próximo ou ir para o plural, concordando com todos os substantivos.'),
  ('concordancia', 'Em que situações se considera facultativa a concordância do adjetivo, no plural ou singular?', 'Quando o adjetivo se refere a dois ou mais substantivos do mesmo gênero, pode ir para o plural ou concordar só com o mais próximo. Exemplo: "Incrível dedicação e esforço" ou "Incríveis dedicação e esforço".'),
  ('concordancia', 'Quando ocorre a chamada concordância atrativa?', 'A concordância atrativa ocorre quando o verbo concorda com o termo mais próximo, mesmo que não seja o núcleo do sujeito, por uma questão estilística ou de preferência regional.'),
  ('concordancia', 'Como se faz a concordância verbal de verbos que exprimem fenômenos da natureza?', 'Verbos que indicam fenômenos da natureza normalmente são impessoais e empregados na 3ª pessoa do singular, exceto quando usados figuradamente ou com sujeito expresso.'),
  ('concordancia', 'Explique a concordância nominal com pronomes de tratamento.', 'Pronomes de tratamento exigem o verbo na 3ª pessoa, mesmo quando se referem à 2ª pessoal do discurso.'),
  ('concordancia', 'Quais são os casos de discordância (não concordância) permitidos na norma culta?', 'Casos como "é proibido entrada", com o particípio invariável quando há palavras femininas, são considerados adequados na norma culta por questão de tradição e uso consagrado.'),
  ('concordancia', 'Como ocorre a concordância em expressões como "mais de um"?', 'Com expressões quantitativas como "mais de um", geralmente o verbo permanece no singular, pois a ideia considerada é a de unidade.'),
  ('concordancia', 'O verbo concorda com o predicativo em construções de predicado nominal?', 'Sim, em construções com predicado nominal e sujeito composto posposto, o verbo pode concordar com o núcleo mais próximo (concordância atrativa) ou ir para o plural (concordância gramatical).'),
  ('concordancia', 'Quando existe concordância entre o verbo e o aposto enumerativo?', 'Nas frases em que o sujeito é um aposto enumerativo, o verbo vai para o plural, concordando com todos os elementos.'),
  ('concordancia', 'Explique a concordância com coletivos.', 'Com substantivos coletivos, o verbo pode ir para o singular (concordando com o coletivo) ou, menos frequentemente, para o plural, se o coletivo vier especificado por um complemento no plural.'),
  ('concordancia', 'Quando o verbo "fazer" é impessoal, como deve ser empregado?', 'O verbo "fazer", indicando tempo decorrido ou clima, é impessoal e usado sempre na 3ª pessoa do singular.'),
  ('concordancia', 'Qual a regra de concordância para expressões partitivas, como "a maioria de", "um grupo de"?', 'Com expressões partitivas, o verbo pode concordar com o núcleo do sujeito (singular) ou com o termo que indica a parte (plural), a depender do sentido e da ênfase.'),
  ('concordancia', 'Como o verbo concorda em frases com porcentagem?', 'Se o número percentual for acompanhado de substantivo, o verbo concorda com ele. Exemplo: "10% dos alunos chegaram".'),
  ('concordancia', 'Quando é correto dizer "é proibido entradas"?', 'A forma correta é "É proibida a entrada", pois o adjetivo deve concordar com o substantivo. Mas, quando o substantivo está sem o artigo, usa-se o adjetivo invariável: "É proibido entrar".'),
  ('concordancia', 'O que são casos especiais de concordância nominal?', 'Casos especiais ocorrem em expressões como "os Estados Unidos são ricos" (plural) e "os Estados Unidos é uma potência" (singular, uso coletivo). Devem-se considerar sentido e tradição do idioma.'),
  ('concordancia', 'Em casos de sujeito composto posposto, como pode ser feita a concordância?', 'Com sujeito composto posposto ao verbo, este pode concordar com todos os núcleos (plural) ou apenas com o mais próximo (singular). Ambas as formas são aceitas.'),
  ('concordancia', 'Explique a concordância em construções com "um e outro".', 'Com a expressão "um e outro", o verbo pode aparecer tanto no singular quanto no plural, sendo o singular mais comum na linguagem culta.'),
  ('concordancia', 'Quando o verbo pode concordar com o predicativo e não com o sujeito?', 'Em frases onde o predicativo se antepõe ao sujeito composto, o verbo pode concordar com ele, estabelecendo concordância atrativa.'),
  ('concordancia', 'Quando é correto o uso do verbo no singular após expressões partitivas?', 'Quando o foco está no coletivo, o verbo deve ficar no singular: "A maioria chegou cedo".'),
  ('concordancia', 'Dê exemplos de expressões invariáveis em concordância nominal.', 'Palavras como "menos", "bastante", "alarmante", "engraçado" (no sentido de curioso) são invariáveis em certas expressões, ou seja, não flexionam em gênero ou número.'),
  ('concordancia', 'O que fazer quando há expressão partitiva seguida de substantivo coletivo?', 'Nesses casos, o verbo pode concordar tanto com a expressão partitiva quanto com o coletivo, dependendo da ênfase desejada.'),
  ('concordancia', 'Explique a concordância verbal em locuções com "os Estados Unidos", "as Filipinas" etc.', 'Nomes próprios de lugares no plural com artigo exigem verbo no plural quando indicam seus habitantes: "Os Estados Unidos são ricos".'),
  ('concordancia', 'Há diferença de concordância nominal com pronomes possessivos?', 'Sim. O pronome possessivo deve concordar em gênero e número com o substantivo a que se refere: "suas casas", "meu livro".'),
  ('concordancia', 'Quando é correto dizer "é bom" ou "é boa"?', '"É bom" quando o sujeito é masculino e singular, "é boa" quando feminino e singular; ambos vão para o plural (bons, boas) conforme o sujeito: "As frutas são boas".'),
  ('concordancia', 'Explique, com exemplo, a concordância do adjetivo com nomes próprios de gênero diferente.', 'Quando o adjetivo se refere a nomes de diferentes gêneros, pode concordar com o mais próximo (singular) ou ser flexionado para o plural: "O carro e a bolsa vermelha" ou "O carro e a bolsa vermelhos".'),
  ('concordancia', 'Quando ocorre a chamada concordância ideológica?', 'A concordância ideológica, ou silepse, ocorre quando a concordância se faz com a ideia ou sentido, e não com a forma literal: "O povo gritava e aplaudiam".'),
  ('concordancia', 'Dê exemplos de expressões em que a concordância nominal foge à regra padrão.', 'Expressões fixas como "é proibido entrada", "é necessário atenção" usam o adjetivo invariável quando o substantivo está sem artigo.');

-- 3. Verificar status após a importação
SELECT 
  'STATUS APÓS IMPORTAÇÃO' as info,
  COUNT(*) as total_flashcards,
  COUNT(DISTINCT topic_id) as total_topicos
FROM public.flashcards f
WHERE f.topic_id IN (
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
);

-- 4. Verificar flashcards por tópico final
SELECT 
  'FLASHCARDS POR TÓPICO FINAL' as info,
  t.id as topic_id,
  t.name as topic_name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
WHERE t.id IN (
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
)
GROUP BY t.id, t.name
ORDER BY flashcard_count DESC, t.name; 