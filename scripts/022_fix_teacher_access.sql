-- Script para corrigir acesso de professores e adicionar dados de teste

-- 1. Garantir que a tabela paid_users existe e tem a estrutura correta
CREATE TABLE IF NOT EXISTS paid_users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Adicionar alguns emails de teste para professores
INSERT INTO paid_users (email, status) VALUES 
('professor@teste.com', 'active'),
('teacher@test.com', 'active'),
('prof@everest.com', 'active')
ON CONFLICT (email) DO NOTHING;

-- 3. Garantir que as tabelas de perfil existem
CREATE TABLE IF NOT EXISTS teacher_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid UUID UNIQUE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    especialidade VARCHAR(255),
    bio TEXT,
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS student_profiles (
    id SERIAL PRIMARY KEY,
    user_uuid UUID UNIQUE NOT NULL,
    nome_completo VARCHAR(255) NOT NULL,
    escola VARCHAR(255),
    ano_escolar VARCHAR(50),
    telefone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Criar algumas turmas de exemplo para professores
INSERT INTO turmas (id, nome, codigo_acesso, professor_uuid, periodo, ativa) VALUES 
('turma-exemplo-1', 'Turma ENEM 2024 - Manhã', 'ENEM2024M', '00000000-0000-0000-0000-000000000000', 'Manhã', true),
('turma-exemplo-2', 'Turma ENEM 2024 - Tarde', 'ENEM2024T', '00000000-0000-0000-0000-000000000000', 'Tarde', true),
('turma-exemplo-3', 'Turma Vestibular 2024', 'VEST2024', '00000000-0000-0000-0000-000000000000', 'Noite', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Adicionar algumas redações de exemplo
INSERT INTO redacoes (titulo, tema, conteudo, status, user_uuid, turma_id, tipo_redacao, data_envio) VALUES 
('Redação sobre Tecnologia', 'O impacto da tecnologia na educação', 'Conteúdo da redação sobre tecnologia...', 'pendente', '00000000-0000-0000-0000-000000000000', 'turma-exemplo-1', 'dissertativa', NOW() - INTERVAL '2 days'),
('Redação sobre Meio Ambiente', 'Sustentabilidade e desenvolvimento', 'Conteúdo da redação sobre meio ambiente...', 'pendente', '00000000-0000-0000-0000-000000000000', 'turma-exemplo-1', 'dissertativa', NOW() - INTERVAL '1 day'),
('Redação sobre Sociedade', 'Desigualdade social no Brasil', 'Conteúdo da redação sobre sociedade...', 'em_correcao', '00000000-0000-0000-0000-000000000000', 'turma-exemplo-2', 'dissertativa', NOW() - INTERVAL '3 days')
ON CONFLICT DO NOTHING;

-- 6. Criar função para debug de usuários
CREATE OR REPLACE FUNCTION debug_user_info(user_email TEXT)
RETURNS TABLE (
    email TEXT,
    has_paid_access BOOLEAN,
    user_role TEXT,
    profile_exists BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        user_email::TEXT,
        EXISTS(SELECT 1 FROM paid_users WHERE paid_users.email = user_email) as has_paid_access,
        COALESCE(ur.role, 'none'::TEXT) as user_role,
        CASE 
            WHEN ur.role = 'teacher' THEN EXISTS(SELECT 1 FROM teacher_profiles tp WHERE tp.user_uuid = (SELECT auth.uid() FROM auth.users WHERE auth.users.email = user_email))
            WHEN ur.role = 'student' THEN EXISTS(SELECT 1 FROM student_profiles sp WHERE sp.user_uuid = (SELECT auth.uid() FROM auth.users WHERE auth.users.email = user_email))
            ELSE false
        END as profile_exists
    FROM user_roles ur
    RIGHT JOIN auth.users au ON ur.user_uuid = au.id
    WHERE au.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
