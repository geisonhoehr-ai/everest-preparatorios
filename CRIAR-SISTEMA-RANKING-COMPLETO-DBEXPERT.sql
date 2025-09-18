-- ========================================
-- CRIAR SISTEMA DE RANKING COMPLETO PARA DBEXPERT
-- ========================================
-- Este script cria o sistema completo de ranking baseado no arquivo de backup

-- 1. CRIAR TABELA RPG_RANKS
CREATE TABLE IF NOT EXISTS "public"."rpg_ranks" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    "category" varchar NOT NULL,
    "level" int4 NOT NULL,
    "title" varchar NOT NULL,
    "insignia" varchar,
    "blessing" text,
    "xp_required" int4 NOT NULL DEFAULT 0,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- 2. CRIAR TABELA SCORES
CREATE TABLE IF NOT EXISTS "public"."scores" (
    "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "score_value" int4 NOT NULL,
    "activity_type" varchar NOT NULL,
    "activity_id" uuid,
    "recorded_at" timestamp NOT NULL DEFAULT now(),
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE UNIQUE INDEX IF NOT EXISTS "rpg_ranks_category_level_idx" ON "public"."rpg_ranks" USING btree ("category", "level");
CREATE INDEX IF NOT EXISTS "rpg_ranks_category_idx" ON "public"."rpg_ranks" USING btree ("category");
CREATE INDEX IF NOT EXISTS "rpg_ranks_xp_required_idx" ON "public"."rpg_ranks" USING btree ("xp_required");

CREATE INDEX IF NOT EXISTS "scores_user_id_idx" ON "public"."scores" USING btree ("user_id");
CREATE INDEX IF NOT EXISTS "scores_activity_type_idx" ON "public"."scores" USING btree ("activity_type");
CREATE INDEX IF NOT EXISTS "scores_recorded_at_idx" ON "public"."scores" USING btree ("recorded_at");

-- 4. LIMPAR DADOS EXISTENTES
DELETE FROM "public"."rpg_ranks" WHERE 1=1;
DELETE FROM "public"."scores" WHERE 1=1;

-- 5. INSERIR RANKS GERAIS (25 níveis)
INSERT INTO "public"."rpg_ranks" (category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    ('general', 1, 'Novato da Guilda', '🧿', 'Todo herói começou do zero. Você já começou.', 0, now(), now()),
    ('general', 2, 'Estudante Arcano', '📜', 'Conhecimento é o primeiro feitiço.', 500, now(), now()),
    ('general', 3, 'Explorador das Ruínas', '🧭', 'Os mapas se revelam para quem ousa explorar.', 1000, now(), now()),
    ('general', 4, 'Portador da Chama', '🔥', 'Uma pequena chama pode incendiar o mundo.', 1500, now(), now()),
    ('general', 5, 'Aprendiz de Batalha', '🛡️', 'Cada erro te fortalece para a próxima luta.', 2000, now(), now()),
    ('general', 6, 'Guerreiro Errante', '⚔️', 'A estrada é longa, mas você já empunha sua arma.', 3000, now(), now()),
    ('general', 7, 'Mago Iniciado', '🔮', 'O poder está na mente disciplinada.', 4000, now(), now()),
    ('general', 8, 'Ranger da Fronteira', '🦅', 'Você enxerga longe, e sabe onde quer chegar.', 5000, now(), now()),
    ('general', 9, 'Alquimista do Saber', '🧪', 'Misturar ideias também é uma forma de magia.', 6000, now(), now()),
    ('general', 10, 'Guardião do Portão', '🏰', 'Agora você guarda conhecimento valioso.', 7000, now(), now()),
    ('general', 11, 'Paladino da Lógica', '⚖️', 'Você defende ideias com verdade e sabedoria.', 10000, now(), now()),
    ('general', 12, 'Feiticeiro Elemental', '🌩️', 'Você manipula o saber como forças da natureza.', 12000, now(), now()),
    ('general', 13, 'Assassino de Dúvidas', '🗡️', 'Nenhuma dúvida resiste à sua disciplina.', 14000, now(), now()),
    ('general', 14, 'Bardo dos Códigos', '🎻', 'Seu conhecimento já inspira outros heróis.', 16000, now(), now()),
    ('general', 15, 'Domador de Pergaminhos', '📚', 'Os livros já te obedecem como aliados.', 18000, now(), now()),
    ('general', 16, 'Arcanista Supremo', '💠', 'Você toca as estrelas com o que sabe.', 25000, now(), now()),
    ('general', 17, 'General da Mente', '🎖️', 'Você lidera batalhas com estratégia e clareza.', 30000, now(), now()),
    ('general', 18, 'Mestre Ilusionista', '🪞', 'Você transforma o complexo em algo simples.', 35000, now(), now()),
    ('general', 19, 'Xamã do Conhecimento Ancestral', '🐺', 'Você carrega a sabedoria de eras.', 40000, now(), now()),
    ('general', 20, 'Arquimago do Saber', '🧙‍♂️', 'Você não apenas aprende: você revela mistérios.', 45000, now(), now()),
    ('general', 21, 'Lâmina do Infinito', '🗡️', 'Seu esforço cortou os limites da dúvida.', 60000, now(), now()),
    ('general', 22, 'Profeta das Runas', '🔤', 'Você lê além das palavras. Você compreende.', 70000, now(), now()),
    ('general', 23, 'Guardião do Portal do Tempo', '⏳', 'Você respeita o tempo, e o tempo te honra.', 80000, now(), now()),
    ('general', 24, 'Avatar do Conhecimento', '🌠', 'Você é a encarnação do que estudou.', 90000, now(), now()),
    ('general', 25, 'Lenda da Torre Eterna', '🏯', 'Seu nome está cravado no topo. Muitos o seguirão.', 100000, now(), now());

-- 6. INSERIR RANKS DE FLASHCARD (5 níveis)
INSERT INTO "public"."rpg_ranks" (category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    ('flashcard', 1, 'Aprendiz de Feitiços', '🧿', 'Primeiros encantamentos da memória.', 0, now(), now()),
    ('flashcard', 2, 'Mago de Pergaminhos', '📜', 'Memória como magia.', 100, now(), now()),
    ('flashcard', 3, 'Arcanista da Memória', '🔮', 'Conhecimento imortal.', 300, now(), now()),
    ('flashcard', 4, 'Arquimago do Saber', '🧙‍♂️', 'Domina o conhecimento.', 600, now(), now()),
    ('flashcard', 5, 'Lenda da Memória', '🌟', 'Sua mente é lendária.', 1000, now(), now());

-- 7. INSERIR RANKS DE QUIZ (5 níveis)
INSERT INTO "public"."rpg_ranks" (category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    ('quiz', 1, 'Recruta da Batalha', '🛡️', 'Primeira luta vencida.', 0, now(), now()),
    ('quiz', 2, 'Soldado Experiente', '⚔️', 'Técnica apurada.', 200, now(), now()),
    ('quiz', 3, 'Capitão da Estratégia', '🎖️', 'Lidera com sabedoria.', 500, now(), now()),
    ('quiz', 4, 'General da Mente', '🏰', 'Comanda o conhecimento.', 800, now(), now()),
    ('quiz', 5, 'Lenda da Batalha', '⚡', 'Invencível no saber.', 1200, now(), now());

-- 8. INSERIR RANKS DE REDAÇÃO (5 níveis)
INSERT INTO "public"."rpg_ranks" (category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    ('redacao', 1, 'Contador de Histórias', '📖', 'Primeiras palavras.', 0, now(), now()),
    ('redacao', 2, 'Poeta da Expressão', '🎭', 'Arte da comunicação.', 300, now(), now()),
    ('redacao', 3, 'Bardo Inspirador', '🎻', 'Inspira com palavras.', 600, now(), now()),
    ('redacao', 4, 'Mestre da Escrita', '✍️', 'Domina a expressão.', 1000, now(), now()),
    ('redacao', 5, 'Lenda da Escrita', '📚', 'Suas palavras são lendárias.', 1500, now(), now());

-- 9. INSERIR RANKS DE PROVA (5 níveis)
INSERT INTO "public"."rpg_ranks" (category, level, title, insignia, blessing, xp_required, created_at, updated_at)
VALUES 
    ('prova', 1, 'Acolito da Verdade', '⚖️', 'Primeira prova de fé.', 0, now(), now()),
    ('prova', 2, 'Cavaleiro da Sabedoria', '🛡️', 'Defende o conhecimento.', 400, now(), now()),
    ('prova', 3, 'Paladino da Lógica', '⚔️', 'Justiça através do saber.', 800, now(), now()),
    ('prova', 4, 'Guardião da Sabedoria', '🏰', 'Protege o conhecimento.', 1200, now(), now()),
    ('prova', 5, 'Lenda da Sabedoria', '🌟', 'Sua sabedoria é lendária.', 2000, now(), now());

-- 10. CRIAR FUNÇÃO PARA ATUALIZAR TOTAL_XP
CREATE OR REPLACE FUNCTION update_user_total_xp()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar total_xp do usuário
    UPDATE "public"."users"
    SET total_xp = total_xp + NEW.score_value,
        updated_at = now()
    WHERE id = NEW.user_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 11. CRIAR TRIGGER PARA ATUALIZAR TOTAL_XP AUTOMATICAMENTE
DROP TRIGGER IF EXISTS trigger_update_total_xp ON "public"."scores";
CREATE TRIGGER trigger_update_total_xp
    AFTER INSERT ON "public"."scores"
    FOR EACH ROW
    EXECUTE FUNCTION update_user_total_xp();

-- 12. CRIAR FUNÇÃO PARA ADICIONAR PONTUAÇÃO
CREATE OR REPLACE FUNCTION add_user_score(
    p_user_id uuid,
    p_score_value int4,
    p_activity_type varchar,
    p_activity_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
    new_score_id uuid;
BEGIN
    -- Inserir nova pontuação
    INSERT INTO "public"."scores" (
        user_id,
        score_value,
        activity_type,
        activity_id
    ) VALUES (
        p_user_id,
        p_score_value,
        p_activity_type,
        p_activity_id
    ) RETURNING id INTO new_score_id;
    
    RETURN new_score_id;
END;
$$ LANGUAGE plpgsql;

-- 13. CRIAR FUNÇÃO PARA OBTER RANKING
CREATE OR REPLACE FUNCTION get_user_ranking(
    p_limit int4 DEFAULT 10
)
RETURNS TABLE (
    rank_position bigint,
    user_id uuid,
    email varchar,
    first_name varchar,
    last_name varchar,
    total_xp int4,
    role user_role
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ROW_NUMBER() OVER (ORDER BY u.total_xp DESC) as rank_position,
        u.id as user_id,
        u.email,
        u.first_name,
        u.last_name,
        u.total_xp,
        u.role
    FROM "public"."users" u
    WHERE u.is_active = true
    ORDER BY u.total_xp DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- 14. CRIAR FUNÇÃO PARA OBTER RANK ATUAL DO USUÁRIO
CREATE OR REPLACE FUNCTION get_user_current_rank(
    p_user_id uuid,
    p_category varchar DEFAULT 'general'
)
RETURNS TABLE (
    rank_id uuid,
    category varchar,
    level int4,
    title varchar,
    insignia varchar,
    blessing text,
    xp_required int4,
    user_xp int4,
    xp_to_next_rank int4
) AS $$
DECLARE
    user_total_xp int4;
BEGIN
    -- Obter XP total do usuário
    SELECT total_xp INTO user_total_xp
    FROM "public"."users"
    WHERE id = p_user_id;
    
    -- Retornar rank atual baseado no XP
    RETURN QUERY
    SELECT 
        r.id as rank_id,
        r.category,
        r.level,
        r.title,
        r.insignia,
        r.blessing,
        r.xp_required,
        user_total_xp as user_xp,
        CASE 
            WHEN r.xp_required <= user_total_xp THEN 0
            ELSE r.xp_required - user_total_xp
        END as xp_to_next_rank
    FROM "public"."rpg_ranks" r
    WHERE r.category = p_category
      AND r.xp_required <= user_total_xp
    ORDER BY r.level DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 15. ADICIONAR COMENTÁRIOS
COMMENT ON TABLE "public"."rpg_ranks" IS 'Define os diferentes ranks de RPG que os usuários podem alcançar com base na experiência';
COMMENT ON TABLE "public"."scores" IS 'Armazena as pontuações individuais obtidas pelos usuários em diferentes atividades';

-- 16. VERIFICAR RESULTADOS
SELECT 'SISTEMA DE RANKING CRIADO COM SUCESSO!' as status;

SELECT 'RANKS CRIADOS' as status,
       category,
       COUNT(*) as total_ranks
FROM "public"."rpg_ranks"
GROUP BY category
ORDER BY category;

SELECT 'TOTAL DE RANKS' as status,
       COUNT(*) as total_ranks
FROM "public"."rpg_ranks";
