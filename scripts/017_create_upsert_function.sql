-- Criar função RPC para fazer upsert do progresso do tópico
CREATE OR REPLACE FUNCTION upsert_topic_progress(
    p_user_uuid UUID,
    p_topic_id TEXT,
    p_correct_count INTEGER,
    p_incorrect_count INTEGER
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO user_topic_progress (user_uuid, topic_id, correct_count, incorrect_count, updated_at)
    VALUES (p_user_uuid, p_topic_id, p_correct_count, p_incorrect_count, NOW())
    ON CONFLICT (user_uuid, topic_id)
    DO UPDATE SET
        correct_count = p_correct_count,
        incorrect_count = p_incorrect_count,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
