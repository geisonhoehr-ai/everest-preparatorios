-- =====================================================
-- SCRIPT PARA MIGRAR TODOS OS DADOS DO BANCO ANTERIOR
-- Adaptando IDs INTEGER para UUIDs
-- =====================================================

-- 1. LIMPAR DADOS EXISTENTES (OPCIONAL)
-- DELETE FROM "public"."flashcards";
-- DELETE FROM "public"."topics";
-- DELETE FROM "public"."subjects";

-- 2. INSERIR MATÉRIAS (SUBJECTS)
INSERT INTO "public"."subjects" (name, description, created_by_user_id)
SELECT 
    'Português',
    'Gramática, Literatura e Redação',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."subjects" WHERE name = 'Português');

INSERT INTO "public"."subjects" (name, description, created_by_user_id)
SELECT 
    'Regulamentos',
    'Regulamentos Militares e Legislação',
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."subjects" WHERE name = 'Regulamentos');

-- 3. INSERIR TÓPICOS (TOPICS)
INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Acentuação Gráfica',
    'Regras de acentuação gráfica',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Acentuação Gráfica');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Fonética e Fonologia',
    'Estudo dos sons da língua',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Fonética e Fonologia');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Ortografia',
    'Regras de escrita',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Ortografia');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Morfologia - Classes de Palavras',
    'Estudo das classes gramaticais',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Morfologia - Classes de Palavras');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Morfologia - Flexão',
    'Flexão nominal e verbal',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Morfologia - Flexão');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Sintaxe - Termos Essenciais',
    'Sujeito e predicado',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe - Termos Essenciais');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Sintaxe - Termos Integrantes',
    'Complementos verbais e nominais',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe - Termos Integrantes');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Sintaxe - Termos Acessórios',
    'Adjuntos e apostos',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe - Termos Acessórios');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Sintaxe - Período Composto',
    'Coordenação e subordinação',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Sintaxe - Período Composto');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Regência',
    'Regência verbal e nominal',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Regência');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Concordância',
    'Concordância verbal e nominal',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Concordância');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Colocação Pronominal',
    'Posição dos pronomes',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Colocação Pronominal');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Crase',
    'Uso da crase',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Crase');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Semântica e Estilística',
    'Significado e estilo',
    (SELECT id FROM "public"."subjects" WHERE name = 'Português'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Semântica e Estilística');

-- 4. INSERIR TÓPICOS DE REGULAMENTOS
INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Estatuto dos Militares',
    'Lei 6.880/1980',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Estatuto dos Militares');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'ICA 111-1',
    'Instrução de Combate Aéreo',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'ICA 111-1');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'ICA 111-2',
    'Instrução de Combate Aéreo',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'ICA 111-2');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'ICA 111-3',
    'Instrução de Combate Aéreo',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'ICA 111-3');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'ICA 111-6',
    'Instrução de Combate Aéreo',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'ICA 111-6');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Lei 13.954/2019',
    'Lei de Organização Militar',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Lei 13.954/2019');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Portaria GM-MD Nº 1.143/2022',
    'Portaria do Ministério da Defesa',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Portaria GM-MD Nº 1.143/2022');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'RCA 34-1',
    'Regulamento de Combate Aéreo',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'RCA 34-1');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'RDAER',
    'Regulamento de Defesa Aérea',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'RDAER');

INSERT INTO "public"."topics" (name, description, subject_id, created_by_user_id)
SELECT 
    'Regulamentos Comuns',
    'Regulamentos gerais',
    (SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos'),
    (SELECT id FROM "public"."users" LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM "public"."topics" WHERE name = 'Regulamentos Comuns');

-- 5. VERIFICAR RESULTADO
SELECT 
    'MIGRAÇÃO CONCLUÍDA' as status,
    COUNT(*) as total_subjects
FROM "public"."subjects";

SELECT 
    'TÓPICOS CRIADOS' as status,
    COUNT(*) as total_topics
FROM "public"."topics";

SELECT 
    'DISTRIBUIÇÃO POR MATÉRIA' as status,
    s.name as materia,
    COUNT(t.id) as total_topics
FROM "public"."subjects" s
LEFT JOIN "public"."topics" t ON s.id = t.subject_id
GROUP BY s.id, s.name
ORDER BY s.name;
