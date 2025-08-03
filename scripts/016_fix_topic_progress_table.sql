-- Verificar se a tabela user_topic_progress existe
DO $$
BEGIN
    -- Dropar a tabela se existir (para recriar com estrutura correta)
    DROP TABLE IF EXISTS user_topic_progress;
    
    -- Recriar a tabela com a estrutura correta
    CREATE TABLE user_topic_progress (
        user_uuid UUID NOT NULL,
        topic_id TEXT NOT NULL REFERENCES topics(id),
        correct_count INTEGER NOT NULL DEFAULT 0,
        incorrect_count INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_uuid, topic_id)
    );
    
    -- Criar índice para otimização
    CREATE INDEX IF NOT EXISTS idx_user_topic_progress_user_uuid ON user_topic_progress (user_uuid);
    
    RAISE NOTICE 'Tabela user_topic_progress recriada com sucesso!';
END $$;

-- Verificar a estrutura da tabela
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_topic_progress'
ORDER BY ordinal_position;
