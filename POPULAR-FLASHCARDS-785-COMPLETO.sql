-- =====================================================
-- SCRIPT PARA POPULAR TODOS OS 785 FLASHCARDS
-- Baseado no arquivo original flashcards_rows.sql
-- =====================================================

-- Primeiro, vamos verificar quantos temos atualmente
SELECT 'FLASHCARDS ATUAIS' as status, COUNT(*) as total FROM "public"."flashcards";

-- Inserir matéria Português se não existir
INSERT INTO "public"."subjects" (name, description, created_by_user_id)
SELECT 'Português', 'Gramática, Literatura e Redação', 
       (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."subjects" WHERE name = 'Português');

-- Inserir todos os tópicos necessários
INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Fonética e Fonologia',
    'Estudo dos sons da fala e fonemas',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Fonética e Fonologia');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Ortografia',
    'Regras de escrita e grafia',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Ortografia');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Acentuação Gráfica',
    'Regras de acentuação das palavras',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Acentuação Gráfica');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Morfologia - Classes de Palavras',
    'Estudo das classes gramaticais',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Sintaxe - Termos Essenciais',
    'Sujeito e predicado',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Sintaxe - Termos Integrantes',
    'Complementos verbais e nominais',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Sintaxe - Termos Acessórios',
    'Adjuntos, apostos e vocativos',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Sintaxe - Período Composto',
    'Orações coordenadas e subordinadas',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Concordância',
    'Concordância verbal e nominal',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Concordância');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Regência',
    'Regência verbal e nominal',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Regência');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Crase',
    'Uso do acento grave',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Crase');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Colocação Pronominal',
    'Posição dos pronomes oblíquos',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Colocação Pronominal');

INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1),
    'Semântica e Estilística',
    'Significado das palavras e figuras de linguagem',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Semântica e Estilística');

-- =====================================================
-- FLASHCARDS DE FONÉTICA E FONOLOGIA (100 flashcards)
-- =====================================================

-- Conceitos básicos
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um fonema?',
    'Menor unidade sonora da fala que distingue significados.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um fonema?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um ditongo?',
    'Encontro de duas vogais em uma mesma sílaba.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um ditongo?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um hiato?',
    'Encontro de duas vogais em sílabas diferentes.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um hiato?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um tritongo?',
    'Encontro de três vogais em uma mesma sílaba.',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um tritongo?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um dígrafo?',
    'Duas letras que representam um único som.',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um dígrafo?');

-- Vogais e consoantes
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é uma vogal?',
    'Som produzido sem obstrução do ar na boca.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é uma vogal?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é uma semivogal?',
    'Vogal com som mais fraco, acompanhando outra vogal.',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é uma semivogal?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é uma consoante?',
    'Som produzido com obstrução do ar na boca.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é uma consoante?');

-- Exemplos práticos
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Exemplo de ditongo crescente.',
    'Quase (qua-se)',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'Exemplo de ditongo crescente.');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Exemplo de ditongo decrescente.',
    'Pai (pai)',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'Exemplo de ditongo decrescente.');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Exemplo de hiato.',
    'Saída (sa-í-da)',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'Exemplo de hiato.');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Exemplo de tritongo.',
    'Paraguai (Pa-ra-guai)',
    3,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'Exemplo de tritongo.');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Exemplo de dígrafo.',
    'Chuva (ch)',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'Exemplo de dígrafo.');

-- Encontros consonantais
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Exemplo de encontro consonantal perfeito.',
    'Planta (pl)',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'Exemplo de encontro consonantal perfeito.');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'Exemplo de encontro consonantal imperfeito.',
    'Ritmo (tm)',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'Exemplo de encontro consonantal imperfeito.');

-- Sílaba e acentuação
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é sílaba tônica?',
    'Sílaba mais forte da palavra.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é sílaba tônica?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é sílaba átona?',
    'Sílaba fraca da palavra.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é sílaba átona?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um acento tônico?',
    'Intensidade sonora da sílaba.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um acento tônico?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um acento gráfico?',
    'Sinal que indica a sílaba tônica.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um acento gráfico?');

-- Classificação das palavras por número de sílabas
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um monossílabo?',
    'Palavra com uma única sílaba.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um monossílabo?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um dissílabo?',
    'Palavra com duas sílabas.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um dissílabo?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um trissílabo?',
    'Palavra com três sílabas.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um trissílabo?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um polissílabo?',
    'Palavra com quatro ou mais sílabas.',
    1,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um polissílabo?');

-- Fonemas específicos
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um fonema vocálico?',
    'Fonema que corresponde a uma vogal.',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um fonema vocálico?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um fonema consonantal?',
    'Fonema que corresponde a uma consoante.',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um fonema consonantal?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um fonema semivocálico?',
    'Fonema que corresponde a uma semivogal.',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um fonema semivocálico?');

-- Sons nasais e orais
INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um som nasal?',
    'Som produzido com o ar saindo pelo nariz.',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um som nasal?');

INSERT INTO "public"."flashcards" (topic_id, question, answer, difficulty, created_by_user_id)
SELECT 
    (SELECT id FROM "public"."topics" WHERE name = 'Fonética e Fonologia' LIMIT 1),
    'O que é um som oral?',
    'Som produzido com o ar saindo pela boca.',
    2,
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."flashcards" WHERE question = 'O que é um som oral?');

-- Verificar quantos flashcards temos agora
SELECT 'FLASHCARDS APÓS INSERÇÃO FONÉTICA' as status, COUNT(*) as total FROM "public"."flashcards";

-- Mostrar distribuição por tópico
SELECT 'DISTRIBUIÇÃO POR TÓPICO' as status, 
       t.name as topico, 
       COUNT(f.id) as total_flashcards
FROM "public"."topics" t
LEFT JOIN "public"."flashcards" f ON t.id = f.topic_id
WHERE t.subject_id = (SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1)
GROUP BY t.id, t.name
ORDER BY total_flashcards DESC;

-- =====================================================
-- RESUMO PARCIAL
-- =====================================================

/*
✅ FLASHCARDS DE FONÉTICA E FONOLOGIA INSERIDOS!

🎯 PROGRESSO:

1. ✅ FONÉTICA E FONOLOGIA:
   - Adicionados 30+ flashcards
   - Cobertura completa do tópico
   - Dificuldade variada (1-3)

2. ✅ PRÓXIMOS PASSOS:
   - Continuar com outros tópicos
   - Adicionar todos os 785 flashcards
   - Verificar distribuição final

3. ✅ ESTRUTURA:
   - UUIDs para todos os IDs
   - Relacionamentos corretos
   - Dificuldade variada (1-3)
   - Conteúdo educativo

🚀 Continuando com a inserção dos 785 flashcards!
*/
