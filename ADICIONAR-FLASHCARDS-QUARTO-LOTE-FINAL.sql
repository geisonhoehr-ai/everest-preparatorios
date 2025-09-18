-- =====================================================
-- QUARTO LOTE - ADICIONAR FLASHCARDS PARA OS TÓPICOS RESTANTES
-- ÚLTIMO LOTE: Completando todos os tópicos
-- =====================================================

-- Verificar quantos temos atualmente
SELECT 'FLASHCARDS ATUAIS' as status, COUNT(*) as total FROM "public"."flashcards";

-- =====================================================
-- SINTAXE - TERMOS ACESSÓRIOS
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'O que são termos acessórios?', 'São os termos que não são essenciais para a oração, mas acrescentam informações.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Quais são os termos acessórios?', 'Adjunto adnominal, adjunto adverbial, aposto e vocativo.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'O que é adjunto adnominal?', 'É o termo que se liga ao substantivo para caracterizá-lo, determiná-lo ou quantificá-lo.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'O que é adjunto adverbial?', 'É o termo que se liga ao verbo, adjetivo ou advérbio para indicar circunstância.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'O que é aposto?', 'É o termo que se liga ao substantivo para explicá-lo, especificá-lo ou resumi-lo.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'O que é vocativo?', 'É o termo que se liga à oração para chamar ou invocar alguém.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adnominal.', 'O menino inteligente (inteligente = adjunto adnominal de menino).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial.', 'Ele chegou cedo (cedo = adjunto adverbial de chegou).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de aposto.', 'João, o médico, chegou (o médico = aposto de João).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de vocativo.', 'João, venha aqui! (João = vocativo).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Quais são os tipos de adjunto adnominal?', 'Artigo, adjetivo, pronome adjetivo, numeral adjetivo, locução adjetiva.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de artigo como adjunto adnominal.', 'O menino (o = artigo, adjunto adnominal de menino).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjetivo como adjunto adnominal.', 'Menino inteligente (inteligente = adjetivo, adjunto adnominal de menino).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de pronome adjetivo como adjunto adnominal.', 'Meu livro (meu = pronome possessivo, adjunto adnominal de livro).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de numeral adjetivo como adjunto adnominal.', 'Três livros (três = numeral, adjunto adnominal de livros).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de locução adjetiva como adjunto adnominal.', 'Casa de madeira (de madeira = locução adjetiva, adjunto adnominal de casa).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Quais são os tipos de adjunto adverbial?', 'Tempo, lugar, modo, intensidade, afirmação, negação, dúvida, causa, finalidade, condição, concessão.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de tempo.', 'Ele chegou ontem (ontem = adjunto adverbial de tempo).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de lugar.', 'Ele mora aqui (aqui = adjunto adverbial de lugar).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de modo.', 'Ele fala devagar (devagar = adjunto adverbial de modo).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de intensidade.', 'Ele é muito inteligente (muito = adjunto adverbial de intensidade).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de afirmação.', 'Ele realmente estudou (realmente = adjunto adverbial de afirmação).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de negação.', 'Ele não estudou (não = adjunto adverbial de negação).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de dúvida.', 'Ele talvez estude (talvez = adjunto adverbial de dúvida).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de causa.', 'Ele faltou por doença (por doença = adjunto adverbial de causa).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de finalidade.', 'Ele estudou para passar (para passar = adjunto adverbial de finalidade).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de condição.', 'Ele passará se estudar (se estudar = adjunto adverbial de condição).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios' LIMIT 1), 'Dê exemplo de adjunto adverbial de concessão.', 'Ele passou embora não tenha estudado (embora não tenha estudado = adjunto adverbial de concessão).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1));

-- =====================================================
-- COLOCAÇÃO PRONOMINAL
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'O que é colocação pronominal?', 'É o estudo da posição dos pronomes oblíquos átonos em relação ao verbo.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Quais são os pronomes oblíquos átonos?', 'Me, te, se, nos, vos, o, a, os, as, lhe, lhes.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Quais são as posições dos pronomes?', 'Próclise, mesóclise e ênclise.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'O que é próclise?', 'É quando o pronome vem antes do verbo.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'O que é mesóclise?', 'É quando o pronome vem no meio do verbo (futuro do presente e futuro do pretérito).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'O que é ênclise?', 'É quando o pronome vem depois do verbo.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de próclise.', 'Eu me levanto (me = próclise).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de mesóclise.', 'Levantar-me-ei (me = mesóclise).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de ênclise.', 'Levante-se (se = ênclise).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Quando usar próclise?', 'Com palavras atrativas: não, nunca, jamais, talvez, se, quando, porque, etc.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de próclise com palavra atrativa.', 'Não me levante (não = palavra atrativa).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Quando usar mesóclise?', 'Com verbos no futuro do presente e futuro do pretérito, quando não há palavra atrativa.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de mesóclise com futuro do presente.', 'Levantar-me-ei (futuro do presente, sem palavra atrativa).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de mesóclise com futuro do pretérito.', 'Levantar-me-ia (futuro do pretérito, sem palavra atrativa).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Quando usar ênclise?', 'Com verbos no imperativo afirmativo, infinitivo, gerúndio e particípio, quando não há palavra atrativa.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de ênclise com imperativo afirmativo.', 'Levante-se (imperativo afirmativo, sem palavra atrativa).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de ênclise com infinitivo.', 'É preciso levantar-se (infinitivo, sem palavra atrativa).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de ênclise com gerúndio.', 'Estou levantando-me (gerúndio, sem palavra atrativa).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de ênclise com particípio.', 'Tenho-me levantado (particípio, sem palavra atrativa).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'O que são palavras atrativas?', 'São palavras que atraem o pronome para antes do verbo (próclise).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Cite exemplos de palavras atrativas.', 'Não, nunca, jamais, talvez, se, quando, porque, que, quem, onde, como, quanto, etc.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'O que é próclise obrigatória?', 'É quando a próclise é obrigatória, independente de palavra atrativa.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de próclise obrigatória.', 'Que me diga (que = palavra atrativa, próclise obrigatória).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'O que é ênclise obrigatória?', 'É quando a ênclise é obrigatória, independente de palavra atrativa.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Colocação Pronominal' LIMIT 1), 'Dê exemplo de ênclise obrigatória.', 'É preciso levantar-se (infinitivo, ênclise obrigatória).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1));

-- Verificar quantos flashcards temos agora
SELECT 'FLASHCARDS APÓS QUARTO LOTE' as status, COUNT(*) as total FROM "public"."flashcards";

-- Mostrar distribuição por tópico
SELECT 'DISTRIBUIÇÃO POR TÓPICO' as status, 
       t.name as topico, 
       COUNT(f.id) as total_flashcards
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
GROUP BY t.id, t.name
ORDER BY total_flashcards DESC;
