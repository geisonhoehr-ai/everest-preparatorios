-- Script para debugar e corrigir o problema das provas
-- Data: 2025-01-28

-- 1. VERIFICAR ESTADO ATUAL DO BANCO
SELECT '=== VERIFICAÇÃO INICIAL ===' as info;

-- Verificar se existem usuários
SELECT 
    'Usuários no sistema:' as tipo,
    COUNT(*) as total
FROM auth.users;

-- Verificar se existem provas
SELECT 
    'Provas no sistema:' as tipo,
    COUNT(*) as total
FROM provas;

-- Verificar provas por status
SELECT 
    status,
    COUNT(*) as total
FROM provas
GROUP BY status;

-- Verificar provas com criador
SELECT 
    p.id,
    p.titulo,
    p.status,
    p.criado_por,
    u.email as criador_email
FROM provas p
LEFT JOIN auth.users u ON p.criado_por = u.id
ORDER BY p.criado_em DESC;

-- 2. CORRIGIR PROBLEMA - CRIAR PROVAS DE EXEMPLO SE NÃO EXISTIREM
DO $$
DECLARE
    user_id UUID;
    prova_count INTEGER;
BEGIN
    -- Verificar se existem usuários
    SELECT id INTO user_id FROM auth.users LIMIT 1;
    
    IF user_id IS NULL THEN
        RAISE NOTICE 'Nenhum usuário encontrado. Criando usuário de teste...';
        
        -- Inserir usuário de teste se não existir
        INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            'teste@everest.com',
            crypt('123456', gen_salt('bf')),
            NOW(),
            NOW(),
            NOW()
        )
        ON CONFLICT (email) DO NOTHING;
        
        SELECT id INTO user_id FROM auth.users WHERE email = 'teste@everest.com';
    END IF;
    
    -- Verificar se existem provas publicadas
    SELECT COUNT(*) INTO prova_count FROM provas WHERE status = 'publicada';
    
    IF prova_count = 0 THEN
        RAISE NOTICE 'Nenhuma prova publicada encontrada. Criando provas de exemplo...';
        
        -- Inserir provas de exemplo
        INSERT INTO provas (id, titulo, descricao, materia, dificuldade, tempo_limite, tentativas_permitidas, nota_minima, status, tags, criado_por, criado_em) VALUES
        (gen_random_uuid(), 'Prova de Regulamentos Militares', 'Avaliação completa sobre regulamentos militares e hierarquia', 'Regulamentos', 'medio', 90, 2, 7.0, 'publicada', ARRAY['regulamentos', 'militar', 'hierarquia'], user_id, NOW()),
        (gen_random_uuid(), 'Quiz de Português - Cegalla', 'Questões sobre gramática, sintaxe e literatura brasileira', 'Português', 'facil', 60, 1, 6.0, 'publicada', ARRAY['português', 'gramática', 'literatura'], user_id, NOW()),
        (gen_random_uuid(), 'Matemática Básica', 'Operações fundamentais e resolução de problemas', 'Matemática', 'medio', 75, 2, 7.5, 'publicada', ARRAY['matemática', 'operações', 'problemas'], user_id, NOW());
        
        RAISE NOTICE 'Provas de exemplo criadas com sucesso!';
    ELSE
        RAISE NOTICE 'Já existem % provas publicadas no sistema.', prova_count;
    END IF;
END $$;

-- 3. VERIFICAÇÃO FINAL
SELECT '=== VERIFICAÇÃO FINAL ===' as info;

-- Verificar provas publicadas
SELECT 
    'Provas publicadas:' as tipo,
    COUNT(*) as total
FROM provas 
WHERE status = 'publicada';

-- Listar provas publicadas
SELECT 
    id,
    titulo,
    materia,
    dificuldade,
    tempo_limite,
    tentativas_permitidas,
    nota_minima,
    criado_por
FROM provas 
WHERE status = 'publicada'
ORDER BY criado_em DESC;

-- Verificar se as provas têm questões
SELECT 
    p.id,
    p.titulo,
    COUNT(q.id) as questoes_count
FROM provas p
LEFT JOIN questoes q ON p.id = q.prova_id
WHERE p.status = 'publicada'
GROUP BY p.id, p.titulo;

-- 4. VERIFICAR POLÍTICAS RLS
SELECT '=== VERIFICAÇÃO RLS ===' as info;

-- Verificar políticas de provas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'provas';

-- Verificar políticas de tentativas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'tentativas_prova';

SELECT '=== SCRIPT CONCLUÍDO ===' as info; 