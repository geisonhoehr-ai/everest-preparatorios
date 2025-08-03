-- Verificar se a tabela user_topic_progress existe e sua estrutura
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_topic_progress'
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_records FROM user_topic_progress;

-- Verificar estrutura da tabela topics
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'topics'
ORDER BY ordinal_position;

-- Listar todos os tópicos disponíveis
SELECT id, name FROM topics ORDER BY name;

-- Verificar se há registros de progresso para algum usuário
SELECT 
    user_uuid,
    topic_id,
    correct_count,
    incorrect_count
FROM user_topic_progress 
LIMIT 10;
