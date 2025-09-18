-- ========================================
-- MIGRAR RANKS RPG COMPLETO
-- ========================================
-- Este script migra os ranks RPG do arquivo de backup

-- 1. LIMPAR RANKS EXISTENTES (SE HOUVER)
DELETE FROM "public"."rpg_ranks";

-- 2. INSERIR RANKS GERAIS (25 níveis)
INSERT INTO "public"."rpg_ranks" (id, category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'general', 1, 'Novato da Guilda', '🧿', 'Todo herói começou do zero. Você já começou.', 0, now(), now()),
    (gen_random_uuid(), 'general', 2, 'Estudante Arcano', '📜', 'Conhecimento é o primeiro feitiço.', 500, now(), now()),
    (gen_random_uuid(), 'general', 3, 'Explorador das Ruínas', '🧭', 'Os mapas se revelam para quem ousa explorar.', 1000, now(), now()),
    (gen_random_uuid(), 'general', 4, 'Portador da Chama', '🔥', 'Uma pequena chama pode incendiar o mundo.', 1500, now(), now()),
    (gen_random_uuid(), 'general', 5, 'Aprendiz de Batalha', '🛡️', 'Cada erro te fortalece para a próxima luta.', 2000, now(), now()),
    (gen_random_uuid(), 'general', 6, 'Guerreiro Errante', '⚔️', 'A estrada é longa, mas você já empunha sua arma.', 3000, now(), now()),
    (gen_random_uuid(), 'general', 7, 'Mago Iniciado', '🔮', 'O poder está na mente disciplinada.', 4000, now(), now()),
    (gen_random_uuid(), 'general', 8, 'Ranger da Fronteira', '🦅', 'Você enxerga longe, e sabe onde quer chegar.', 5000, now(), now()),
    (gen_random_uuid(), 'general', 9, 'Alquimista do Saber', '🧪', 'Misturar ideias também é uma forma de magia.', 6000, now(), now()),
    (gen_random_uuid(), 'general', 10, 'Guardião do Portão', '🏰', 'Agora você guarda conhecimento valioso.', 7000, now(), now()),
    (gen_random_uuid(), 'general', 11, 'Paladino da Lógica', '⚖️', 'Você defende ideias com verdade e sabedoria.', 10000, now(), now()),
    (gen_random_uuid(), 'general', 12, 'Feiticeiro Elemental', '🌩️', 'Você manipula o saber como forças da natureza.', 12000, now(), now()),
    (gen_random_uuid(), 'general', 13, 'Assassino de Dúvidas', '🗡️', 'Nenhuma dúvida resiste à sua disciplina.', 14000, now(), now()),
    (gen_random_uuid(), 'general', 14, 'Bardo dos Códigos', '🎻', 'Seu conhecimento já inspira outros heróis.', 16000, now(), now()),
    (gen_random_uuid(), 'general', 15, 'Domador de Pergaminhos', '📚', 'Os livros já te obedecem como aliados.', 18000, now(), now()),
    (gen_random_uuid(), 'general', 16, 'Arcanista Supremo', '💠', 'Você toca as estrelas com o que sabe.', 25000, now(), now()),
    (gen_random_uuid(), 'general', 17, 'General da Mente', '🎖️', 'Você lidera batalhas com estratégia e clareza.', 30000, now(), now()),
    (gen_random_uuid(), 'general', 18, 'Mestre Ilusionista', '🪞', 'Você transforma o complexo em algo simples.', 35000, now(), now()),
    (gen_random_uuid(), 'general', 19, 'Xamã do Conhecimento Ancestral', '🐺', 'Você carrega a sabedoria de eras.', 40000, now(), now()),
    (gen_random_uuid(), 'general', 20, 'Arquimago do Saber', '🧙‍♂️', 'Você não apenas aprende: você revela mistérios.', 45000, now(), now()),
    (gen_random_uuid(), 'general', 21, 'Lâmina do Infinito', '🗡️', 'Seu esforço cortou os limites da dúvida.', 60000, now(), now()),
    (gen_random_uuid(), 'general', 22, 'Profeta das Runas', '🔤', 'Você lê além das palavras. Você compreende.', 70000, now(), now()),
    (gen_random_uuid(), 'general', 23, 'Guardião do Portal do Tempo', '⏳', 'Você respeita o tempo, e o tempo te honra.', 80000, now(), now()),
    (gen_random_uuid(), 'general', 24, 'Avatar do Conhecimento', '🌠', 'Você é a encarnação do que estudou.', 90000, now(), now()),
    (gen_random_uuid(), 'general', 25, 'Lenda da Torre Eterna', '🏯', 'Seu nome está cravado no topo. Muitos o seguirão.', 100000, now(), now());

-- 3. INSERIR RANKS DE FLASHCARD (5 níveis)
INSERT INTO "public"."rpg_ranks" (id, category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'flashcard', 1, 'Aprendiz de Feitiços', '🧿', 'Primeiros encantamentos da memória.', 0, now(), now()),
    (gen_random_uuid(), 'flashcard', 2, 'Mago de Pergaminhos', '📜', 'Memória como magia.', 100, now(), now()),
    (gen_random_uuid(), 'flashcard', 3, 'Arcanista da Memória', '🔮', 'Conhecimento imortal.', 300, now(), now()),
    (gen_random_uuid(), 'flashcard', 4, 'Arquimago do Saber', '🧙‍♂️', 'Domina o conhecimento.', 600, now(), now()),
    (gen_random_uuid(), 'flashcard', 5, 'Lenda da Memória', '🌟', 'Sua mente é lendária.', 1000, now(), now());

-- 4. INSERIR RANKS DE QUIZ (5 níveis)
INSERT INTO "public"."rpg_ranks" (id, category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'quiz', 1, 'Recruta da Batalha', '🛡️', 'Primeira luta vencida.', 0, now(), now()),
    (gen_random_uuid(), 'quiz', 2, 'Soldado Experiente', '⚔️', 'Técnica apurada.', 200, now(), now()),
    (gen_random_uuid(), 'quiz', 3, 'Capitão da Estratégia', '🎖️', 'Lidera com sabedoria.', 500, now(), now()),
    (gen_random_uuid(), 'quiz', 4, 'General da Mente', '🏰', 'Comanda o conhecimento.', 800, now(), now()),
    (gen_random_uuid(), 'quiz', 5, 'Lenda da Batalha', '⚡', 'Invencível no saber.', 1200, now(), now());

-- 5. INSERIR RANKS DE REDAÇÃO (5 níveis)
INSERT INTO "public"."rpg_ranks" (id, category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'redacao', 1, 'Contador de Histórias', '📖', 'Primeiras palavras.', 0, now(), now()),
    (gen_random_uuid(), 'redacao', 2, 'Poeta da Expressão', '🎭', 'Arte da comunicação.', 300, now(), now()),
    (gen_random_uuid(), 'redacao', 3, 'Bardo Inspirador', '🎻', 'Inspira com palavras.', 600, now(), now()),
    (gen_random_uuid(), 'redacao', 4, 'Mestre da Escrita', '✍️', 'Domina a expressão.', 1000, now(), now()),
    (gen_random_uuid(), 'redacao', 5, 'Lenda da Escrita', '📚', 'Suas palavras são lendárias.', 1500, now(), now());

-- 6. INSERIR RANKS DE PROVA (5 níveis)
INSERT INTO "public"."rpg_ranks" (id, category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'prova', 1, 'Acolito da Verdade', '⚖️', 'Primeira prova de fé.', 0, now(), now()),
    (gen_random_uuid(), 'prova', 2, 'Cavaleiro da Sabedoria', '🛡️', 'Defende o conhecimento.', 400, now(), now()),
    (gen_random_uuid(), 'prova', 3, 'Paladino da Lógica', '⚔️', 'Justiça através do saber.', 800, now(), now()),
    (gen_random_uuid(), 'prova', 4, 'Guardião da Sabedoria', '🏰', 'Protege o conhecimento.', 1200, now(), now()),
    (gen_random_uuid(), 'prova', 5, 'Lenda da Sabedoria', '🌟', 'Sua sabedoria é lendária.', 2000, now(), now());

-- 7. VERIFICAR RANKS CRIADOS
SELECT 'RANKS CRIADOS' as status,
       category,
       COUNT(*) as total_ranks
FROM "public"."rpg_ranks"
GROUP BY category
ORDER BY category;

-- 8. VER DISTRIBUIÇÃO DE RANKS
SELECT 'DISTRIBUIÇÃO DE RANKS' as status,
       category,
       level,
       title,
       insignia,
       xp_required
FROM "public"."rpg_ranks"
ORDER BY category, level;

-- 9. VERIFICAR TOTAL DE RANKS
SELECT 'TOTAL DE RANKS' as status,
       COUNT(*) as total_ranks
FROM "public"."rpg_ranks";
