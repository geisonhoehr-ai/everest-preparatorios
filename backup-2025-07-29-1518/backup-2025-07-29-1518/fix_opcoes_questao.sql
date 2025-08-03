-- Add is_correta column to opcoes_questao table
ALTER TABLE opcoes_questao 
ADD COLUMN is_correta boolean DEFAULT false NOT NULL;