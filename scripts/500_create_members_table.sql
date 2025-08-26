-- =====================================================
-- CRIAÇÃO DE TABELAS RELACIONADAS A MEMBERS - SISTEMA COMPLETO
-- EVEREST PREPARATÓRIOS - GESTÃO DE MEMBROS
-- =====================================================

-- Este script cria tabelas relacionadas para complementar a tabela members existente
-- A tabela members já existe no Supabase com 11 colunas

-- =====================================================
-- TABELA DE ASSINATURAS (OPCIONAL)
-- =====================================================

CREATE TABLE IF NOT EXISTS member_subscriptions (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    subscription_name TEXT NOT NULL,
    subscription_type TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    end_date TIMESTAMP WITH TIME ZONE,
    price DECIMAL(10,2),
    payment_method TEXT,
    auto_renew BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA DE CURSOS/CLASSES DO MEMBRO
-- =====================================================

CREATE TABLE IF NOT EXISTS member_courses (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    course_name TEXT NOT NULL,
    class_name TEXT,
    progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in_progress', 'completed', 'dropped')),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_date TIMESTAMP WITH TIME ZONE,
    last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- TABELA DE ATIVIDADES DO MEMBRO
-- =====================================================

CREATE TABLE IF NOT EXISTS member_activities (
    id SERIAL PRIMARY KEY,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'flashcard', 'quiz', 'redacao', 'prova', 'download', 'upload')),
    activity_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para assinaturas
CREATE INDEX IF NOT EXISTS idx_member_subscriptions_member_id ON member_subscriptions(member_id);
CREATE INDEX IF NOT EXISTS idx_member_subscriptions_status ON member_subscriptions(status);

-- Índices para cursos
CREATE INDEX IF NOT EXISTS idx_member_courses_member_id ON member_courses(member_id);
CREATE INDEX IF NOT EXISTS idx_member_courses_status ON member_courses(status);

-- Índices para atividades
CREATE INDEX IF NOT EXISTS idx_member_activities_member_id ON member_activities(member_id);
CREATE INDEX IF NOT EXISTS idx_member_activities_activity_type ON member_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_member_activities_created_at ON member_activities(created_at);

-- =====================================================
-- FUNÇÕES TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- =====================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_member_subscriptions_updated_at BEFORE UPDATE ON member_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_courses_updated_at BEFORE UPDATE ON member_courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_member_activities_updated_at BEFORE UPDATE ON member_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- POLÍTICAS RLS (ROW LEVEL SECURITY)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE member_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE member_activities ENABLE ROW LEVEL SECURITY;

-- Políticas para assinaturas - usando email do membro para autenticação
CREATE POLICY "Membros podem ver suas próprias assinaturas" ON member_subscriptions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM members m
            JOIN user_roles ur ON ur.user_uuid = auth.uid()::text
            WHERE m.id = member_id
            AND m.email = ur.user_uuid
        )
    );

CREATE POLICY "Admins podem gerenciar assinaturas" ON member_subscriptions
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_uuid = auth.uid()::text
            AND role IN ('admin', 'teacher')
        )
    );

-- Políticas para cursos - usando email do membro para autenticação
CREATE POLICY "Membros podem ver seus próprios cursos" ON member_courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM members m
            JOIN user_roles ur ON ur.user_uuid = auth.uid()::text
            WHERE m.id = member_id
            AND m.email = ur.user_uuid
        )
    );

CREATE POLICY "Admins podem gerenciar cursos" ON member_courses
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_uuid = auth.uid()::text
            AND role IN ('admin', 'teacher')
        )
    );

-- Políticas para atividades - usando email do membro para autenticação
CREATE POLICY "Membros podem ver suas próprias atividades" ON member_activities
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM members m
            JOIN user_roles ur ON ur.user_uuid = auth.uid()::text
            WHERE m.id = member_id
            AND m.email = ur.user_uuid
        )
    );

CREATE POLICY "Admins podem gerenciar atividades" ON member_activities
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM user_roles
            WHERE user_uuid = auth.uid()::text
            AND role IN ('admin', 'teacher')
        )
    );

-- =====================================================
-- DADOS DE EXEMPLO
-- =====================================================

-- Inserir assinaturas de exemplo APENAS se existirem membros
DO $$
DECLARE
    member_count INTEGER;
    first_member_id INTEGER;
    second_member_id INTEGER;
BEGIN
    -- Verificar quantos membros existem
    SELECT COUNT(*) INTO member_count FROM members;
    
    IF member_count > 0 THEN
        -- Pegar o primeiro e segundo membro se existirem
        SELECT id INTO first_member_id FROM members ORDER BY id LIMIT 1;
        
        IF member_count > 1 THEN
            SELECT id INTO second_member_id FROM members ORDER BY id OFFSET 1 LIMIT 1;
        END IF;
        
        -- Inserir assinaturas apenas se houver membros
        IF first_member_id IS NOT NULL THEN
            INSERT INTO member_subscriptions (member_id, subscription_name, subscription_type, status, price) VALUES
            (first_member_id, 'Plano Básico Mensal', 'basic', 'active', 29.90);
            
            -- Inserir cursos para o primeiro membro
            INSERT INTO member_courses (member_id, course_name, class_name, progress, status) VALUES
            (first_member_id, 'Português Básico', 'Turma A', 45, 'in_progress'),
            (first_member_id, 'Regulamentos Militares', 'Turma B', 20, 'enrolled');
            
            -- Inserir atividades para o primeiro membro
            INSERT INTO member_activities (member_id, activity_type, activity_data) VALUES
            (first_member_id, 'login', '{"browser": "Chrome", "platform": "Windows"}'),
            (first_member_id, 'flashcard', '{"topic": "Português", "cards_studied": 15}');
        END IF;
        
        -- Inserir dados para o segundo membro se existir
        IF second_member_id IS NOT NULL THEN
            INSERT INTO member_subscriptions (member_id, subscription_name, subscription_type, status, price) VALUES
            (second_member_id, 'Plano Premium Anual', 'premium', 'active', 299.90);
            
            INSERT INTO member_courses (member_id, course_name, class_name, progress, status) VALUES
            (second_member_id, 'Português Avançado', 'Turma C', 80, 'in_progress'),
            (second_member_id, 'Preparação para Concurso', 'Turma D', 60, 'in_progress');
            
            INSERT INTO member_activities (member_id, activity_type, activity_data) VALUES
            (second_member_id, 'login', '{"browser": "Firefox", "platform": "MacOS"}'),
            (second_member_id, 'quiz', '{"topic": "Regulamentos", "score": 85}');
        END IF;
        
        RAISE NOTICE 'Dados de exemplo inseridos para % membros', member_count;
    ELSE
        RAISE NOTICE 'Nenhum membro encontrado. Execute primeiro o script de criação de membros.';
    END IF;
END $$;

-- =====================================================
-- FUNÇÕES ÚTEIS
-- =====================================================

-- Função para obter estatísticas de membros (referencia a tabela members existente)
CREATE OR REPLACE FUNCTION get_members_stats()
RETURNS TABLE (
    total_members BIGINT,
    active_members BIGINT,
    students_count BIGINT,
    teachers_count BIGINT,
    admins_count BIGINT,
    premium_subscriptions BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE status = 'active') as active_members,
        COUNT(*) FILTER (WHERE member_type = 'student') as students_count,
        COUNT(*) FILTER (WHERE member_type = 'teacher') as teachers_count,
        COUNT(*) FILTER (WHERE member_type = 'admin') as admins_count,
        COUNT(*) FILTER (WHERE subscription_type IN ('premium', 'unlimited')) as premium_subscriptions
    FROM members;
END;
$$ LANGUAGE plpgsql;

-- Função para buscar membros com filtros (referencia a tabela members existente)
CREATE OR REPLACE FUNCTION search_members(
    search_term TEXT DEFAULT '',
    member_type_filter TEXT DEFAULT '',
    status_filter TEXT DEFAULT '',
    subscription_filter TEXT DEFAULT ''
)
RETURNS TABLE (
    id INTEGER,
    full_name TEXT,
    email TEXT,
    member_type TEXT,
    status TEXT,
    subscription_type TEXT,
    enrollment_date TIMESTAMP WITH TIME ZONE,
    last_seen_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        m.id,
        m.full_name,
        m.email,
        m.member_type,
        m.status,
        m.subscription_type,
        m.enrollment_date,
        m.last_seen_at
    FROM members m
    WHERE
        (search_term = '' OR
         m.full_name ILIKE '%' || search_term || '%' OR
         m.email ILIKE '%' || search_term || '%')
        AND (member_type_filter = '' OR m.member_type = member_type_filter)
        AND (status_filter = '' OR m.status = status_filter)
        AND (subscription_filter = '' OR m.subscription_type = subscription_filter)
    ORDER BY m.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as tabelas foram criadas
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_name IN ('member_subscriptions', 'member_courses', 'member_activities')
ORDER BY table_name;

-- Verificar dados de exemplo
SELECT 'member_subscriptions' as table_name, COUNT(*) as record_count FROM member_subscriptions
UNION ALL
SELECT 'member_courses', COUNT(*) FROM member_courses
UNION ALL
SELECT 'member_activities', COUNT(*) FROM member_activities;

-- =====================================================
-- RESUMO DA IMPLEMENTAÇÃO
-- =====================================================

/*
✅ TABELAS CRIADAS:
- member_subscriptions: Assinaturas dos membros
- member_courses: Cursos/classes dos membros
- member_activities: Atividades dos membros

✅ FUNCIONALIDADES:
- CRUD completo para assinaturas, cursos e atividades
- Sistema de assinaturas
- Controle de cursos/classes
- Rastreamento de atividades
- Políticas de segurança (RLS)
- Funções úteis para estatísticas e busca

✅ INTEGRAÇÃO:
- Com tabela members existente (11 colunas)
- Com sistema de autenticação Supabase
- Com tabelas existentes (user_roles)

🎯 PRÓXIMOS PASSOS:
1. Executar este script no Supabase
2. Atualizar a página de membros para usar nova estrutura
3. Testar funcionalidades de CRUD
4. Integrar com sistema de criação de usuários
*/
