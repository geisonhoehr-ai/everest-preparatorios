-- Remove as tabelas com nomes em português que estão causando conflito,
-- assumindo que suas contrapartes em inglês já existem e são as desejadas.
DROP TABLE IF EXISTS pontuacoes_usuario;
DROP TABLE IF EXISTS progresso_topico_usuario;

-- Garante que as colunas 'user_uuid' existam nas tabelas com nomes em inglês.
-- Este bloco é idempotente (seguro para rodar múltiplas vezes).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_scores' AND column_name = 'user_uuid'
  ) THEN
    ALTER TABLE user_scores ADD COLUMN user_uuid uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_topic_progress' AND column_name = 'user_uuid'
  ) THEN
    ALTER TABLE user_topic_progress ADD COLUMN user_uuid uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'user_flashcard_progress' AND column_name = 'user_uuid'
  ) THEN
    ALTER TABLE user_flashcard_progress ADD COLUMN user_uuid uuid;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'topics' AND column_name = 'user_uuid'
  ) THEN
    -- Embora 'topics' não tenha user_id, é bom ter user_uuid para consistência futura
    ALTER TABLE topics ADD COLUMN user_uuid uuid;
  END IF;
END $$;
