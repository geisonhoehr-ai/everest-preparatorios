-- =====================================================
-- ADICIONAR FLASHCARDS PARA OS TÓPICOS RESTANTES
-- =====================================================

-- Verificar quantos temos atualmente
SELECT 'FLASHCARDS ATUAIS' as status, COUNT(*) as total FROM "public"."flashcards";

-- =====================================================
-- MORFOLOGIA - FLEXÃO
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'O que é flexão?', 'É a variação que as palavras sofrem para expressar diferentes significados gramaticais.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Quais os tipos de flexão?', 'Flexão nominal (gênero e número) e flexão verbal (pessoa, número, tempo, modo, voz).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'O que é flexão nominal?', 'É a variação do substantivo, adjetivo, artigo e pronome em gênero e número.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Como funciona a flexão de gênero?', 'Substantivos podem ser masculinos (o) ou femininos (a).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Como funciona a flexão de número?', 'Substantivos podem ser singulares (um) ou plurais (mais de um).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'O que é flexão verbal?', 'É a variação do verbo para expressar pessoa, número, tempo, modo e voz.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Quais são as pessoas do verbo?', '1ª pessoa (eu, nós), 2ª pessoa (tu, vós), 3ª pessoa (ele/ela, eles/elas).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Quais são os números do verbo?', 'Singular (eu, tu, ele) e plural (nós, vós, eles).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Quais são os tempos verbais?', 'Presente, pretérito (perfeito, imperfeito, mais-que-perfeito) e futuro (do presente, do pretérito).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Quais são os modos verbais?', 'Indicativo, subjuntivo e imperativo.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Quais são as vozes verbais?', 'Ativa, passiva e reflexiva.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'O que é flexão irregular?', 'É quando a palavra não segue o padrão normal de flexão.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Dê exemplos de flexão irregular.', 'Bom/bom, mal/mal, cão/cães, mão/mãos.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'O que é flexão supletiva?', 'É quando a palavra muda completamente na flexão: ir/fui, ser/era.', 3, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Morfologia - Flexão' LIMIT 1), 'Como identificar o radical?', 'É a parte invariável da palavra que contém o significado básico.', 2, (SELECT id FROM "public"."users" LIMIT 1));

-- =====================================================
-- REGÊNCIA
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'O que é regência?', 'É a relação de dependência entre um termo regente e um termo regido.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Quais os tipos de regência?', 'Regência verbal e regência nominal.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'O que é regência verbal?', 'É a relação entre o verbo e seus complementos (objeto direto, objeto indireto).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'O que é regência nominal?', 'É a relação entre um nome (substantivo, adjetivo, advérbio) e seu complemento.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'O que é objeto direto?', 'É o complemento que se liga ao verbo sem preposição obrigatória.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'O que é objeto indireto?', 'É o complemento que se liga ao verbo com preposição obrigatória.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Como identificar objeto direto?', 'Substitui por "o que" ou "quem" e não exige preposição.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Como identificar objeto indireto?', 'Substitui por "de que", "para que", "a que" e exige preposição.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Dê exemplo de verbo transitivo direto.', 'Comer: "Ele comeu a maçã" (comeu o quê? - a maçã).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Dê exemplo de verbo transitivo indireto.', 'Precisar: "Ele precisa de ajuda" (precisa de quê? - de ajuda).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Dê exemplo de verbo transitivo direto e indireto.', 'Dar: "Ele deu o livro ao amigo" (deu o quê? - o livro; deu a quem? - ao amigo).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'O que é verbo intransitivo?', 'É o verbo que não precisa de complemento para ter sentido completo.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Dê exemplo de verbo intransitivo.', 'Dormir: "Ele dormiu" (não precisa de complemento).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'O que é verbo de ligação?', 'É o verbo que liga o sujeito ao predicativo, não expressa ação.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Dê exemplo de verbo de ligação.', 'Ser: "Ele é inteligente" (é = verbo de ligação).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'O que é complemento nominal?', 'É o complemento que se liga a um nome (substantivo, adjetivo, advérbio) com preposição.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Regência' LIMIT 1), 'Dê exemplo de complemento nominal.', 'Amor à vida (amor de quê? - à vida).', 2, (SELECT id FROM "public"."users" LIMIT 1));

-- =====================================================
-- SINTAXE - TERMOS INTEGRANTES
-- =====================================================

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
VALUES 
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'O que são termos integrantes?', 'São os termos que completam o sentido do verbo ou do nome.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Quais são os termos integrantes?', 'Objeto direto, objeto indireto e complemento nominal.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'O que é objeto direto?', 'É o complemento que se liga ao verbo sem preposição obrigatória.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'O que é objeto indireto?', 'É o complemento que se liga ao verbo com preposição obrigatória.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'O que é complemento nominal?', 'É o complemento que se liga a um nome com preposição.', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Como identificar objeto direto?', 'Substitui por "o que" ou "quem" e não exige preposição.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Como identificar objeto indireto?', 'Substitui por "de que", "para que", "a que" e exige preposição.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Como identificar complemento nominal?', 'Substitui por "de que", "para que", "a que" e se liga a um nome.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Dê exemplo de objeto direto.', 'Comer: "Ele comeu a maçã" (comeu o quê? - a maçã).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Dê exemplo de objeto indireto.', 'Precisar: "Ele precisa de ajuda" (precisa de quê? - de ajuda).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Dê exemplo de complemento nominal.', 'Amor à vida (amor de quê? - à vida).', 1, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'O que é objeto direto preposicionado?', 'É o objeto direto que aparece com preposição por questões de clareza ou ênfase.', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Dê exemplo de objeto direto preposicionado.', 'Amar: "Ele ama à esposa" (por clareza, evita ambiguidade).', 2, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'O que é objeto direto pleonástico?', 'É o objeto direto que repete o sujeito para dar ênfase.', 3, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Dê exemplo de objeto direto pleonástico.', 'A vida, eu a vivo intensamente (a vida = objeto direto pleonástico).', 3, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'O que é objeto direto oracional?', 'É o objeto direto representado por uma oração subordinada substantiva objetiva direta.', 3, (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes' LIMIT 1), 'Dê exemplo de objeto direto oracional.', 'Desejo que você seja feliz (que você seja feliz = objeto direto oracional).', 3, (SELECT id FROM "public"."users" LIMIT 1));

-- Verificar quantos flashcards temos agora
SELECT 'FLASHCARDS APÓS ADIÇÃO' as status, COUNT(*) as total FROM "public"."flashcards";

-- Mostrar distribuição por tópico
SELECT 'DISTRIBUIÇÃO POR TÓPICO' as status, 
       t.name as topico, 
       COUNT(f.id) as total_flashcards
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
GROUP BY t.id, t.name
ORDER BY total_flashcards DESC;
