-- Script para criar usuários de teste se não existirem
-- ATENÇÃO: Este script só funciona se você tiver privilégios de admin

-- Função para criar usuários de teste (apenas se não existirem)
DO $$
DECLARE
    professor_exists boolean := false;
    aluno_exists boolean := false;
BEGIN
    -- Verificar se usuários existem
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'professor@teste.com') INTO professor_exists;
    SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'aluno@teste.com') INTO aluno_exists;
    
    IF NOT professor_exists THEN
        RAISE NOTICE '❌ Usuário professor@teste.com NÃO EXISTE!';
        RAISE NOTICE '📝 AÇÃO NECESSÁRIA: Vá para Authentication > Users no Supabase Dashboard e crie:';
        RAISE NOTICE '   Email: professor@teste.com';
        RAISE NOTICE '   Password: 123456';
        RAISE NOTICE '   Confirme o email automaticamente';
    ELSE
        RAISE NOTICE '✅ Usuário professor@teste.com existe';
    END IF;
    
    IF NOT aluno_exists THEN
        RAISE NOTICE '❌ Usuário aluno@teste.com NÃO EXISTE!';
        RAISE NOTICE '📝 AÇÃO NECESSÁRIA: Vá para Authentication > Users no Supabase Dashboard e crie:';
        RAISE NOTICE '   Email: aluno@teste.com';
        RAISE NOTICE '   Password: 123456';
        RAISE NOTICE '   Confirme o email automaticamente';
    ELSE
        RAISE NOTICE '✅ Usuário aluno@teste.com existe';
    END IF;
    
    IF professor_exists AND aluno_exists THEN
        RAISE NOTICE '🎉 Ambos os usuários existem! Execute o script de configuração completa.';
    END IF;
END $$;
