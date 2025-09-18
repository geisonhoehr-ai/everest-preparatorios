-- =====================================================
-- QUINTO LOTE - ADICIONAR FLASHCARDS PARA OS TÓPICOS RESTANTES
-- ÚLTIMO LOTE: Completando TODOS os tópicos
-- =====================================================

-- Verificar quantos temos atualmente
SELECT 'FLASHCARDS ATUAIS' as status, COUNT(*) as total FROM "public"."flashcards";

-- =====================================================
-- SEMÂNTICA E ESTILÍSTICA
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é semântica?', 'É o estudo do significado das palavras e das relações entre elas.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é estilística?', 'É o estudo dos recursos expressivos da língua e dos efeitos de sentido.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é sinônimo?', 'São palavras que têm significados iguais ou muito próximos.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é antônimo?', 'São palavras que têm significados opostos.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é homônimo?', 'São palavras que têm a mesma forma, mas significados diferentes.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é parônimo?', 'São palavras que têm formas parecidas, mas significados diferentes.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Dê exemplo de sinônimo.', 'Casa e moradia (significados iguais).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Dê exemplo de antônimo.', 'Bom e ruim (significados opostos).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Dê exemplo de homônimo.', 'Canto (do verbo cantar) e canto (esquina) - mesma forma, significados diferentes.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Dê exemplo de parônimo.', 'Eminente (ilustre) e iminente (que está para acontecer).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é denotação?', 'É o significado literal, objetivo da palavra.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é conotação?', 'É o significado figurado, subjetivo da palavra.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Dê exemplo de denotação.', 'Casa = construção para morar (sentido literal).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Dê exemplo de conotação.', 'Casa = lar, família (sentido figurado).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é polissemia?', 'É quando uma palavra tem vários significados relacionados.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Dê exemplo de polissemia.', 'Pé = parte do corpo, base de objeto, unidade de medida.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que é ambiguidade?', 'É quando uma palavra ou frase pode ter mais de uma interpretação.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Dê exemplo de ambiguidade.', 'Vi o menino na rua (quem estava na rua? eu ou o menino?).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'O que são figuras de linguagem?', 'São recursos expressivos que criam efeitos especiais de sentido.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Semântica e Estilística' LIMIT 1), 'Quais os tipos de figuras de linguagem?', 'Figuras de palavra, figuras de pensamento e figuras de construção.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1));

-- =====================================================
-- CONCORDÂNCIA
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'O que é concordância?', 'É a harmonia entre os termos da oração em gênero, número e pessoa.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Quais os tipos de concordância?', 'Concordância verbal e concordância nominal.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'O que é concordância verbal?', 'É a harmonia entre o verbo e o sujeito em pessoa e número.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'O que é concordância nominal?', 'É a harmonia entre o substantivo e seus determinantes em gênero e número.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Como fazer concordância com sujeito simples?', 'O verbo concorda com o sujeito em pessoa e número.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Como fazer concordância com sujeito composto?', 'O verbo vai para o plural e concorda com o sujeito mais próximo ou com todos.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Dê exemplo de concordância com sujeito simples.', 'O menino brinca (menino = singular, brinca = 3ª pessoa singular).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Dê exemplo de concordância com sujeito composto.', 'João e Maria brincam (João e Maria = plural, brincam = 3ª pessoa plural).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Como fazer concordância com sujeito coletivo?', 'O verbo concorda com o coletivo (singular) ou com o termo que ele representa (plural).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Dê exemplo de concordância com sujeito coletivo.', 'A multidão aplaudiu (concordância com o coletivo) ou A multidão aplaudiram (concordância com o termo representado).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Como fazer concordância com sujeito partitivo?', 'O verbo concorda com o termo que vem depois de "mais de", "menos de", "cerca de".', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Dê exemplo de concordância com sujeito partitivo.', 'Mais de um aluno faltou (concordância com "um aluno").', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Como fazer concordância com sujeito oracional?', 'O verbo fica na 3ª pessoa do singular.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Dê exemplo de concordância com sujeito oracional.', 'É importante que você estude (concordância com "é importante").', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Como fazer concordância nominal?', 'O adjetivo concorda com o substantivo em gênero e número.', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Dê exemplo de concordância nominal.', 'As meninas bonitas (meninas = feminino plural, bonitas = feminino plural).', 1, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Como fazer concordância com adjetivo composto?', 'O adjetivo composto concorda com o substantivo mais próximo.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Dê exemplo de concordância com adjetivo composto.', 'As meninas luso-brasileiras (concordância com "meninas").', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Como fazer concordância com adjetivo invariável?', 'O adjetivo invariável não muda de forma.', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Concordância' LIMIT 1), 'Dê exemplo de adjetivo invariável.', 'As meninas feliz (feliz = invariável, não muda).', 2, (SELECT id FROM "public"."users" WHERE role = 'student' LIMIT 1));

-- Verificar quantos flashcards temos agora
SELECT 'FLASHCARDS APÓS QUINTO LOTE' as status, COUNT(*) as total FROM "public"."flashcards";

-- Mostrar distribuição por tópico
SELECT 'DISTRIBUIÇÃO POR TÓPICO' as status, 
       t.name as topico, 
       COUNT(f.id) as total_flashcards
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
GROUP BY t.id, t.name
ORDER BY total_flashcards DESC;
