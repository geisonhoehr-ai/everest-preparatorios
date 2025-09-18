-- =====================================================
-- SCRIPT CORRIGIDO PARA MIGRAR FLASHCARDS
-- Usando os nomes corretos dos tópicos
-- =====================================================

-- Primeiro, vamos verificar quantos temos atualmente
SELECT 'FLASHCARDS ATUAIS' as status, COUNT(*) as total FROM "public"."flashcards";

-- =====================================================
-- MIGRAR FLASHCARDS - PORTUGUÊS
-- =====================================================

-- Acentuação Gráfica
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'O que mudou com o Novo Acordo?', 'Não se acentuam mais: ideia, heroico, feiura, bocaiuva.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'Como identificar a sílaba tônica?', 'É a sílaba pronunciada com maior intensidade.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'O que são palavras oxítonas?', 'Palavras com acento tônico na última sílaba: café, amor, tupi.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'O que são palavras paroxítonas?', 'Palavras com acento tônico na penúltima sílaba: casa, livro, fácil.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'O que são palavras proparoxítonas?', 'Palavras com acento tônico na antepenúltima sílaba: médico, árvore.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'Quando usar acento agudo?', 'Em vogais tônicas abertas: pá, pé, pó, má.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'Quando usar acento circunflexo?', 'Em vogais tônicas fechadas: avô, lâmpada, pêssego.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'O que indica o trema?', 'Não existe mais em português (era usado em: linguiça, freqüente).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Acentuação Gráfica' LIMIT 1), 'Como acentuar verbos ter e vir?', 'Ele tem/vem (sem acento), eles têm/vêm (com acento).', 2, (SELECT id FROM "public"."users" LIMIT 1));

-- Morfologia - Classes de Palavras (CORRIGIDO: hífen em vez de dois pontos)
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quantas classes de palavras existem?', 'Dez: substantivo, artigo, adjetivo, numeral, pronome, verbo, advérbio, preposição, conjunção, interjeição.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é substantivo?', 'Palavra que nomeia seres, objetos, sentimentos, qualidades, ações.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quais os tipos de substantivo?', 'Comum/próprio, concreto/abstrato, primitivo/derivado, simples/composto, coletivo.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é artigo?', 'Palavra que antecede o substantivo, determinando-o.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quais são os artigos?', 'Definidos: o, a, os, as. Indefinidos: um, uma, uns, umas.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é adjetivo?', 'Palavra que caracteriza, qualifica ou determina o substantivo.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quais os tipos de adjetivo?', 'Explicativo/restritivo, primitivo/derivado, simples/composto, pátrio.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é numeral?', 'Palavra que indica quantidade, ordem, múltiplo ou fração.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quais os tipos de numeral?', 'Cardinal, ordinal, multiplicativo, fracionário.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é pronome?', 'Palavra que substitui ou acompanha o substantivo.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quais os tipos de pronome?', 'Pessoal, possessivo, demonstrativo, indefinido, interrogativo, relativo.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é verbo?', 'Palavra que exprime ação, estado, mudança de estado ou fenômeno da natureza.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quais os tipos de verbo?', 'Transitivo direto/indireto, intransitivo, de ligação, auxiliar, principal.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é advérbio?', 'Palavra invariável que modifica verbo, adjetivo ou outro advérbio.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quais os tipos de advérbio?', 'Tempo, lugar, modo, intensidade, afirmação, negação, dúvida.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é preposição?', 'Palavra invariável que liga dois termos, estabelecendo relação de dependência.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Cite preposições essenciais.', 'A, ante, após, até, com, contra, de, desde, em, entre, para, por, sem, sob, sobre, trás.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é conjunção?', 'Palavra invariável que liga orações ou termos de mesma função.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'Quais os tipos de conjunção?', 'Coordenativas (aditivas, adversativas, alternativas, conclusivas, explicativas) e subordinativas.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras' LIMIT 1), 'O que é interjeição?', 'Palavra invariável que exprime sentimentos, emoções, sensações.', 1, (SELECT id FROM "public"."users" LIMIT 1));

-- Sintaxe - Período Composto (CORRIGIDO: hífen em vez de dois pontos)
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'O que é período composto?', 'É o período formado por duas ou mais orações.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'Quais os tipos de período composto?', 'Por coordenação, por subordinação e misto.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'O que são orações coordenadas?', 'São orações independentes, ligadas por conjunções coordenativas.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'Quais os tipos de orações coordenadas?', 'Assindéticas e sindéticas (aditivas, adversativas, alternativas, conclusivas, explicativas).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'O que são orações subordinadas?', 'São orações dependentes de uma oração principal.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'Quais os tipos de orações subordinadas?', 'Substantivas, adjetivas e adverbiais.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'O que são orações subordinadas substantivas?', 'São as que exercem função de substantivo na oração principal.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'Quais os tipos de subordinadas substantivas?', 'Subjetiva, objetiva direta, objetiva indireta, completiva nominal, predicativa, apositiva.', 3, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'O que são orações subordinadas adjetivas?', 'São as que exercem função de adjetivo, modificando um substantivo.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'Quais os tipos de subordinadas adjetivas?', 'Restritivas (sem vírgulas) e explicativas (com vírgulas).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'O que são orações subordinadas adverbiais?', 'São as que exercem função de advérbio na oração principal.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto' LIMIT 1), 'Quais os tipos de subordinadas adverbiais?', 'Causal, consecutiva, condicional, concessiva, comparativa, conformativa, final, temporal, proporcional.', 3, (SELECT id FROM "public"."users" LIMIT 1));

-- Fonética e Fonologia
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é fonética?', 'É o estudo dos sons da fala, sua produção e percepção.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é fonologia?', 'É o estudo dos fonemas e sua função na língua.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é fonema?', 'É a menor unidade sonora capaz de distinguir significados.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é letra?', 'É a representação gráfica do fonema.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'Quantos fonemas tem o português?', 'Aproximadamente 33 fonemas.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que são vogais?', 'São fonemas produzidos sem obstáculo à passagem do ar.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'Quantas vogais tem o português?', 'Sete vogais orais: a, é, ê, i, ó, ô, u.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que são consoantes?', 'São fonemas produzidos com obstáculo à passagem do ar.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que são semivogais?', 'São os fonemas i e u quando não são tônicos: pai, mau.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é sílaba?', 'É o fonema ou grupo de fonemas pronunciados numa só emissão de voz.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é encontro vocálico?', 'É a sequência de duas ou três vogais numa palavra.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'Quais os tipos de encontro vocálico?', 'Ditongo, tritongo e hiato.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é ditongo?', 'É o encontro de uma vogal com uma semivogal na mesma sílaba.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'Quais os tipos de ditongo?', 'Crescente (semivogal + vogal) e decrescente (vogal + semivogal).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é tritongo?', 'É o encontro de semivogal + vogal + semivogal na mesma sílaba.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é hiato?', 'É o encontro de duas vogais em sílabas diferentes.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é encontro consonantal?', 'É a sequência de duas ou mais consoantes numa palavra.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'Quais os tipos de encontro consonantal?', 'Perfeito (na mesma sílaba) e imperfeito (em sílabas diferentes).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'O que é dígrafo?', 'É o grupo de duas letras representando um só fonema.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1), 'Cite exemplos de dígrafos.', 'ch, lh, nh, rr, ss, qu, gu, sc, sç, xc.', 2, (SELECT id FROM "public"."users" LIMIT 1));

-- Verificar quantos flashcards temos agora
SELECT 'FLASHCARDS APÓS MIGRAÇÃO' as status, COUNT(*) as total FROM "public"."flashcards";

-- Mostrar distribuição por tópico
SELECT 'DISTRIBUIÇÃO POR TÓPICO' as status, 
       t.name as topico, 
       COUNT(f.id) as total_flashcards
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
GROUP BY t.id, t.name
ORDER BY total_flashcards DESC;
