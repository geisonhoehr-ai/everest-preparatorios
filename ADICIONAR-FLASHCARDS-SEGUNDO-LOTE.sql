-- =====================================================
-- SEGUNDO LOTE - ADICIONAR FLASHCARDS PARA OS TÓPICOS RESTANTES
-- =====================================================

-- Verificar quantos temos atualmente
SELECT 'FLASHCARDS ATUAIS' as status, COUNT(*) as total FROM "public"."flashcards";

-- =====================================================
-- CRASE
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'O que é crase?', 'É a fusão da preposição "a" com o artigo "a" ou "as", representada pelo acento grave (`).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Quando usar crase?', 'Quando há preposição "a" + artigo "a" ou "as" antes de substantivo feminino.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Como identificar se deve usar crase?', 'Substitua o substantivo feminino por um masculino. Se aparecer "ao", use crase.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Dê exemplo de uso de crase.', 'Vou à escola (vou ao colégio - substituição confirma a crase).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Quando NÃO usar crase?', 'Antes de substantivo masculino, verbos, pronomes pessoais, artigos indefinidos.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Dê exemplo de NÃO uso de crase.', 'Vou a casa (casa = substantivo masculino, não há artigo).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase antes de pronomes pessoais?', 'Não. Exemplo: "Falei a ela" (não "à ela").', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase antes de verbos?', 'Não. Exemplo: "Vou a estudar" (não "à estudar").', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "a partir de"?', 'Sim. Exemplo: "A partir das 8h" (a partir de + as = às).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "até"?', 'Sim, quando seguido de artigo. Exemplo: "Até às 18h" (até + as = às).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "desde"?', 'Sim, quando seguido de artigo. Exemplo: "Desde às 8h" (desde + as = às).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "entre"?', 'Não. Exemplo: "Entre as 8h e 10h" (não "entre às 8h").', 2, (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "mediante"?', 'Não. Exemplo: "Mediante as condições" (não "mediante às condições").', 2, (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "salvo"?', 'Não. Exemplo: "Salvo as exceções" (não "salvo às exceções").', 2, (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "segundo"?', 'Não. Exemplo: "Segundo as regras" (não "segundo às regras").', 2, (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "conforme"?', 'Não. Exemplo: "Conforme as normas" (não "conforme às normas").', 2, (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "durante"?', 'Não. Exemplo: "Durante as férias" (não "durante às férias").', 2, (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1), 'Crase com "mediante"?', 'Não. Exemplo: "Mediante as condições" (não "mediante às condições").', 2, (SELECT id FROM "public"."topics" WHERE name = 'Crase' LIMIT 1));

-- =====================================================
-- SINTAXE - TERMOS ESSENCIAIS
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que são termos essenciais?', 'São os termos fundamentais da oração: sujeito e predicado.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é sujeito?', 'É o termo da oração sobre o qual se declara algo.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é predicado?', 'É o termo da oração que declara algo sobre o sujeito.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Quais os tipos de sujeito?', 'Determinado (simples, composto, oculto) e indeterminado.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é sujeito simples?', 'É o sujeito formado por apenas um núcleo.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é sujeito composto?', 'É o sujeito formado por dois ou mais núcleos.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é sujeito oculto?', 'É o sujeito que não aparece explicitamente na oração, mas pode ser identificado pela desinência verbal.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é sujeito indeterminado?', 'É o sujeito que não pode ser identificado, mesmo pela desinência verbal.', 2, (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Dê exemplo de sujeito simples.', 'O menino brinca (O menino = sujeito simples).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Dê exemplo de sujeito composto.', 'João e Maria brincam (João e Maria = sujeito composto).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Dê exemplo de sujeito oculto.', 'Brincamos no parque (nós = sujeito oculto, identificado pela desinência -mos).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Dê exemplo de sujeito indeterminado.', 'Disseram que vai chover (quem disse? não se sabe).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é oração sem sujeito?', 'É a oração que não possui sujeito, como as orações com verbos impessoais.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Dê exemplo de oração sem sujeito.', 'Chove muito (chover = verbo impessoal, não tem sujeito).', 2, (SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Quais os tipos de predicado?', 'Predicado verbal, predicado nominal e predicado verbo-nominal.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é predicado verbal?', 'É o predicado cujo núcleo é um verbo de ação.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é predicado nominal?', 'É o predicado cujo núcleo é um nome (substantivo ou adjetivo) ligado ao sujeito por um verbo de ligação.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'O que é predicado verbo-nominal?', 'É o predicado que possui um verbo de ação e um predicativo do sujeito.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Dê exemplo de predicado verbal.', 'O menino brinca (brinca = verbo de ação).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Dê exemplo de predicado nominal.', 'O menino é inteligente (é = verbo de ligação, inteligente = predicativo).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais' LIMIT 1), 'Dê exemplo de predicado verbo-nominal.', 'O menino chegou cansado (chegou = verbo de ação, cansado = predicativo).', 2, (SELECT id FROM "public"."users" LIMIT 1));

-- Verificar quantos flashcards temos agora
SELECT 'FLASHCARDS APÓS SEGUNDO LOTE' as status, COUNT(*) as total FROM "public"."flashcards";

-- Mostrar distribuição por tópico
SELECT 'DISTRIBUIÇÃO POR TÓPICO' as status, 
       t.name as topico, 
       COUNT(f.id) as total_flashcards
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
GROUP BY t.id, t.name
ORDER BY total_flashcards DESC;
