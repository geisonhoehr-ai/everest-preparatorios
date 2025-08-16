-- Script para configurar completamente os usuários de teste
-- Execute APENAS DEPOIS de criar os usuários no Authentication

DO $$
DECLARE
    professor_id uuid;
    aluno_id uuid;
BEGIN
    -- Buscar IDs dos usuários
    SELECT id INTO professor_id FROM auth.users WHERE email = 'professor@teste.com';
    SELECT id INTO aluno_id FROM auth.users WHERE email = 'aluno@teste.com';
    
    -- Configurar professor
    IF professor_id IS NOT NULL THEN
        -- Garantir que está em paid_users
        INSERT INTO paid_users (email, status) 
        VALUES ('professor@teste.com', 'active')
        ON CONFLICT (email) DO UPDATE SET status = 'active';
        
        -- Configurar role
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (professor_id::text, 'teacher', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'teacher',
            profile_completed = true;
        
        -- Criar perfil
        INSERT INTO teacher_profiles (user_uuid, nome_completo, especialidade, formacao)
        VALUES (professor_id::text, 'Professor Teste', 'Língua Portuguesa', 'Licenciatura em Letras')
        ON CONFLICT (user_uuid) DO UPDATE SET
            nome_completo = 'Professor Teste',
            especialidade = 'Língua Portuguesa',
            formacao = 'Licenciatura em Letras';
            
        RAISE NOTICE '✅ Professor configurado: professor@teste.com';
    ELSE
        RAISE NOTICE '❌ Professor não encontrado! Crie o usuário primeiro.';
    END IF;
    
    -- Configurar aluno
    IF aluno_id IS NOT NULL THEN
        -- Garantir que está em paid_users
        INSERT INTO paid_users (email, status) 
        VALUES ('aluno@teste.com', 'active')
        ON CONFLICT (email) DO UPDATE SET status = 'active';
        
        -- Configurar role
        INSERT INTO user_roles (user_uuid, role, first_login, profile_completed)
        VALUES (aluno_id::text, 'student', false, true)
        ON CONFLICT (user_uuid) DO UPDATE SET 
            role = 'student',
            profile_completed = true;
        
        -- Criar perfil
        INSERT INTO student_profiles (user_uuid, nome_completo, escola, ano_escolar)
        VALUES (aluno_id::text, 'Aluno Teste', 'Escola Teste', '3ano')
        ON CONFLICT (user_uuid) DO UPDATE SET
            nome_completo = 'Aluno Teste',
            escola = 'Escola Teste',
            ano_escolar = '3ano';
            
        RAISE NOTICE '✅ Aluno configurado: aluno@teste.com';
    ELSE
        RAISE NOTICE '❌ Aluno não encontrado! Crie o usuário primeiro.';
    END IF;
    
    RAISE NOTICE '🎯 Configuração completa! Teste o login agora.';
END $$;
