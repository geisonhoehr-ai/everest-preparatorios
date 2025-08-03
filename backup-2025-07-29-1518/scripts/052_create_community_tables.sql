DO $$
BEGIN

    -- Tabela de Categorias da Comunidade
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_categories') THEN
        CREATE TABLE public.community_categories (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name TEXT NOT NULL UNIQUE,
            slug TEXT NOT NULL UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela community_categories criada.';
    ELSE
        RAISE NOTICE 'Tabela community_categories já existe.';
    END IF;

    -- Tabela de Posts da Comunidade
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_posts') THEN
        CREATE TABLE public.community_posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            category_id UUID REFERENCES public.community_categories(id) ON DELETE SET NULL,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela community_posts criada.';
    ELSE
        RAISE NOTICE 'Tabela community_posts já existe.';
    END IF;

    -- Tabela de Comentários da Comunidade
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_comments') THEN
        CREATE TABLE public.community_comments (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        RAISE NOTICE 'Tabela community_comments criada.';
    ELSE
        RAISE NOTICE 'Tabela community_comments já existe.';
    END IF;

    -- Funções para atualizar 'updated_at'
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- Triggers para community_posts
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_community_posts_updated_at') THEN
        CREATE TRIGGER set_community_posts_updated_at
        BEFORE UPDATE ON public.community_posts
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger set_community_posts_updated_at criado.';
    ELSE
        RAISE NOTICE 'Trigger set_community_posts_updated_at já existe.';
    END IF;

    -- RLS para community_categories
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users on community_categories') THEN
        ALTER TABLE public.community_categories ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable read access for all users on community_categories" ON public.community_categories FOR SELECT USING (true);
        RAISE NOTICE 'RLS para community_categories configurado.';
    ELSE
        RAISE NOTICE 'RLS para community_categories já existe.';
    END IF;

    -- RLS para community_posts
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users on community_posts') THEN
        ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable read access for all users on community_posts" ON public.community_posts FOR SELECT USING (true);
        CREATE POLICY "Enable insert for authenticated users on community_posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Enable update for authenticated users on community_posts" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Enable delete for authenticated users on community_posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'RLS para community_posts configurado.';
    ELSE
        RAISE NOTICE 'RLS para community_posts já existe.';
    END IF;

    -- RLS para community_comments
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users on community_comments') THEN
        ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable read access for all users on community_comments" ON public.community_comments FOR SELECT USING (true);
        CREATE POLICY "Enable insert for authenticated users on community_comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Enable update for authenticated users on community_comments" ON public.community_comments FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Enable delete for authenticated users on community_comments" ON public.community_comments FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'RLS para community_comments configurado.';
    ELSE
        RAISE NOTICE 'RLS para community_comments já existe.';
    END IF;

    -- Inserir categorias padrão se não existirem
    INSERT INTO public.community_categories (name, slug)
    VALUES
        ('Geral', 'geral'),
        ('Dúvidas', 'duvidas'),
        ('Sugestões', 'sugestoes'),
        ('Técnico', 'tecnico')
    ON CONFLICT (name) DO NOTHING;
    RAISE NOTICE 'Categorias padrão inseridas ou já existentes.';

END $$;
