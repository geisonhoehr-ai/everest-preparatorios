-- Inserir um professor de exemplo (você pode usar seu próprio UUID)
INSERT INTO user_roles (user_uuid, role, first_login, profile_completed) VALUES
('00000000-0000-0000-0000-000000000001', 'teacher', false, true)
ON CONFLICT (user_uuid) DO UPDATE SET role = 'teacher';

-- Inserir perfil do professor
INSERT INTO teacher_profiles (
  user_uuid, 
  nome_completo, 
  especialidade, 
  bio, 
  experiencia_anos, 
  formacao,
  certificacoes
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Prof. João Silva',
  'Língua Portuguesa e Redação',
  'Professor especialista em preparação para ENEM e vestibulares, com foco em redação dissertativa-argumentativa.',
  15,
  'Licenciatura em Letras - USP, Mestrado em Linguística Aplicada',
  ARRAY['Certificação ENEM', 'Especialização em Redação Acadêmica']
)
ON CONFLICT (user_uuid) DO UPDATE SET
  nome_completo = EXCLUDED.nome_completo,
  especialidade = EXCLUDED.especialidade,
  bio = EXCLUDED.bio;

-- Atualizar turma existente com mais informações
UPDATE turmas SET 
  codigo_acesso = 'TURMA2024',
  max_alunos = 30,
  periodo = 'noite',
  ano_letivo = 2024
WHERE id = 'turma-2024-a';
