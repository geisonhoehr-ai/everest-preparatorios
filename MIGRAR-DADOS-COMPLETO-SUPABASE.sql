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
VALUES 
    ('Português', 'Gramática, Literatura e Redação', (SELECT id FROM "public"."users" LIMIT 1)),
    ('Regulamentos', 'Regulamentos Militares e Legislação', (SELECT id FROM "public"."users" LIMIT 1))
ON CONFLICT (name) DO NOTHING;

-- 3. INSERIR TÓPICOS (TOPICS) - PORTUGUÊS
INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
VALUES 
    -- Português
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Acentuação Gráfica', 'Regras de acentuação das palavras', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Colocação Pronominal', 'Posição dos pronomes oblíquos', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Concordância Verbal e Nominal', 'Concordância verbal e nominal', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Crase', 'Uso do acento grave', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Fonetica e Fonologia', 'Estudo dos sons da fala e fonemas', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Morfologia: Classes de Palavras', 'Estudo das classes gramaticais', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Morfologia: Flexão', 'Flexão nominal e verbal', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Ortografia', 'Regras de escrita e grafia', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Regência Verbal e Nominal', 'Regência verbal e nominal', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Semântica e Estilística', 'Significado das palavras e figuras de linguagem', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Sintaxe: Período Composto', 'Orações coordenadas e subordinadas', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Sintaxe: Termos Acessórios', 'Adjuntos, apostos e vocativos', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Sintaxe: Termos Essenciais', 'Sujeito e predicado', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Português' LIMIT 1), 'Sintaxe: Termos Integrantes', 'Complementos verbais e nominais', (SELECT id FROM "public"."users" LIMIT 1))
ON CONFLICT (subject_id, name) DO NOTHING;

-- 4. INSERIR TÓPICOS (TOPICS) - REGULAMENTOS
INSERT INTO "public"."topics" (subject_id, name, description, created_by_user_id)
VALUES 
    -- Regulamentos
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'Estatuto dos Militares', 'Estatuto dos Militares do Estado', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'ICA 111-1', 'Instrução de Combate Aéreo 111-1', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'ICA 111-2', 'Instrução de Combate Aéreo 111-2', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'ICA 111-3', 'Instrução de Combate Aéreo 111-3', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'ICA 111-6', 'Instrução de Combate Aéreo 111-6', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'Lei 13.954/2019', 'Lei 13.954 de 2019', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'Portaria GM-MD Nº 1.143/2022', 'Portaria GM-MD Nº 1.143/2022', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'RCA 34-1', 'Regulamento de Combate Aéreo 34-1', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'RDAER', 'Regulamento de Defesa Aérea e Controle de Espaço Aéreo', (SELECT id FROM "public"."users" LIMIT 1)),
    ((SELECT id FROM "public"."subjects" WHERE name = 'Regulamentos' LIMIT 1), 'Regulamentos Comuns', 'Regulamentos comuns militares', (SELECT id FROM "public"."users" LIMIT 1))
ON CONFLICT (subject_id, name) DO NOTHING;

-- 5. VERIFICAR TÓPICOS CRIADOS
SELECT 'TÓPICOS CRIADOS' as status, 
       s.name as materia,
       t.name as topico
FROM "public"."subjects" s
JOIN "public"."topics" t ON s.id = t.subject_id
ORDER BY s.name, t.name;

-- =====================================================
-- PRÓXIMOS PASSOS
-- =====================================================

/*
✅ ESTRUTURA CRIADA!

🎯 PRÓXIMOS PASSOS:

1. ✅ MATÉRIAS E TÓPICOS:
   - 2 matérias criadas (Português, Regulamentos)
   - 24 tópicos criados
   - Estrutura pronta para flashcards

2. ✅ PRÓXIMO SCRIPT:
   - Migrar todos os 785 flashcards
   - Adaptar IDs antigos para UUIDs
   - Mapear tópicos corretamente

3. ✅ SCRIPTS ADICIONAIS:
   - Migrar quizzes
   - Migrar questões de quiz
   - Migrar usuários pagantes
   - Migrar rankings RPG

🚀 Execute este script primeiro, depois executaremos os flashcards!
*/
