-- Renomear a tabela de tópicos de volta para inglês (se estiver em português)
ALTER TABLE IF EXISTS topicos RENAME TO topics;

-- Renomear a tabela de progresso do usuário por tópico de volta para inglês (se estiver em português)
ALTER TABLE IF EXISTS progresso_topico_usuario RENAME TO user_topic_progress;

-- Renomear a tabela de pontuações do usuário de volta para inglês (se estiver em português)
ALTER TABLE IF EXISTS pontuacoes_usuario RENAME TO user_scores;

-- Renomear a tabela de progresso de flashcards por usuário (SM-2) de volta para inglês (se estiver em português)
ALTER TABLE IF EXISTS progresso_flashcard_usuario RENAME TO user_flashcard_progress;

-- Renomear índices para refletir os nomes originais das tabelas (opcional, mas boa prática)
ALTER INDEX IF EXISTS idx_progresso_flashcard_usuario_data_revisao RENAME TO idx_next_review_date;
