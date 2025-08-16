-- Renomear a tabela de pontuações do usuário de volta para inglês (se estiver em português)
ALTER TABLE IF EXISTS pontuacoes_usuario RENAME TO user_scores;

-- Renomear a tabela de progresso do usuário por tópico de volta para inglês (se estiver em português)
ALTER TABLE IF EXISTS progresso_topico_usuario RENAME TO user_topic_progress;

-- Nota: 'topics', 'flashcards', 'user_flashcard_progress' e 'user_scores'
-- já parecem estar em inglês ou não precisam de renomeação adicional
-- com base na sua última imagem.
