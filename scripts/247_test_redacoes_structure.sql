-- Script para testar a estrutura da tabela redacoes

-- Verificar estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'redacoes' 
ORDER BY ordinal_position;

-- Verificar se há dados na tabela temas_redacao
SELECT 
    COUNT(*) as total_temas,
    MIN(id) as primeiro_id,
    MAX(id) as ultimo_id
FROM temas_redacao;

-- Verificar se há dados na tabela redacoes
SELECT 
    COUNT(*) as total_redacoes,
    COUNT(DISTINCT user_uuid) as usuarios_com_redacoes
FROM redacoes;

-- Testar inserção de uma redação de teste (se não houver dados)
DO $$
DECLARE
    test_user_uuid UUID;
    test_tema_id INTEGER;
BEGIN
    -- Pegar um usuário de teste
    SELECT user_uuid INTO test_user_uuid 
    FROM user_roles 
    WHERE role = 'student' 
    LIMIT 1;
    
    -- Pegar um tema de teste
    SELECT id INTO test_tema_id 
    FROM temas_redacao 
    LIMIT 1;
    
    -- Inserir redação de teste se não existir
    IF NOT EXISTS (SELECT 1 FROM redacoes WHERE titulo = 'Teste de Upload') THEN
        INSERT INTO redacoes (
            user_uuid, 
            titulo, 
            tema, 
            tema_id, 
            tipo_redacao, 
            status, 
            observacoes
        ) VALUES (
            test_user_uuid,
            'Teste de Upload',
            'Tema de Teste',
            test_tema_id,
            'dissertativa',
            'enviada',
            'Redação de teste para verificar funcionamento'
        );
        
        RAISE NOTICE 'Redação de teste inserida com sucesso';
    ELSE
        RAISE NOTICE 'Redação de teste já existe';
    END IF;
END $$;

-- Verificar redações de teste
SELECT 
    id,
    titulo,
    tema,
    status,
    created_at
FROM redacoes 
WHERE titulo LIKE '%Teste%'
ORDER BY created_at DESC; 