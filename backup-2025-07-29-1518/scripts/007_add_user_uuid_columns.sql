-- Adiciona colunas UUID só se ainda não existirem
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
