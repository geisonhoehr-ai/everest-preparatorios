DO $$
BEGIN
    -- Tabela de Curtidas da Comunidade
    IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'community_likes') THEN
        CREATE TABLE public.community_likes (
            post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            PRIMARY KEY (post_id, user_id) -- Garante que um usuário só pode curtir um post uma vez
        );
        RAISE NOTICE 'Tabela community_likes criada.';
    ELSE
        RAISE NOTICE 'Tabela community_likes já existe.';
    END IF;

    -- Adicionar coluna 'tags' à tabela community_posts se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'community_posts' AND column_name = 'tags') THEN
        ALTER TABLE public.community_posts ADD COLUMN tags TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Coluna tags adicionada à tabela community_posts.';
    ELSE
        RAISE NOTICE 'Coluna tags já existe na tabela community_posts.';
    END IF;

    -- RLS para community_likes
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Enable read access for all users on community_likes') THEN
        ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
        CREATE POLICY "Enable read access for all users on community_likes" ON public.community_likes FOR SELECT USING (true);
        CREATE POLICY "Enable insert for authenticated users on community_likes" ON public.community_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Enable delete for authenticated users on community_likes" ON public.community_likes FOR DELETE USING (auth.uid() = user_id);
        RAISE NOTICE 'RLS para community_likes configurado.';
    ELSE
        RAISE NOTICE 'RLS para community_likes já existe.';
    END IF;

END $$;
