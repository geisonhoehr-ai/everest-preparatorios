CREATE TABLE IF NOT EXISTS paid_users (
  email TEXT PRIMARY KEY,
  -- Você pode adicionar outras colunas aqui, como:
  -- memberkit_user_id TEXT,
  -- course_id TEXT,
  -- subscription_status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Opcional: Adicionar um índice para buscas rápidas por email
CREATE INDEX IF NOT EXISTS idx_paid_users_email ON paid_users (email);
