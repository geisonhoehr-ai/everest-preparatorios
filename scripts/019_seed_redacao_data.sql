-- Inserir templates de redação
INSERT INTO templates_redacao (nome, tipo, descricao, arquivo_url) VALUES
('Folha de Redação ENEM', 'enem', 'Modelo oficial de folha de redação do ENEM com 30 linhas', '/templates/folha-enem.pdf'),
('Folha de Redação Vestibular', 'vestibular', 'Modelo padrão para vestibulares com 25 linhas', '/templates/folha-vestibular.pdf'),
('Folha de Redação Concurso', 'concurso', 'Modelo para concursos públicos com 20 linhas', '/templates/folha-concurso.pdf')
ON CONFLICT DO NOTHING;

-- Inserir temas de redação de exemplo
INSERT INTO temas_redacao (titulo, descricao, tipo_prova, ano, dificuldade, tags) VALUES
('Democratização do acesso ao cinema no Brasil', 'Tema sobre acesso cultural e democratização do cinema brasileiro', 'enem', 2019, 'medio', ARRAY['cultura', 'democratização', 'cinema']),
('O estigma associado às doenças mentais na sociedade brasileira', 'Discussão sobre preconceito e saúde mental no Brasil', 'enem', 2020, 'dificil', ARRAY['saúde mental', 'preconceito', 'sociedade']),
('Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil', 'Tema sobre documentação e cidadania', 'enem', 2021, 'medio', ARRAY['cidadania', 'documentação', 'direitos']),
('Desafios para a valorização de comunidades e povos tradicionais no Brasil', 'Valorização de comunidades tradicionais', 'enem', 2022, 'medio', ARRAY['comunidades tradicionais', 'valorização', 'cultura']),
('Desafios para o enfrentamento da invisibilidade do trabalho de cuidado realizado pela mulher no Brasil', 'Trabalho de cuidado e gênero', 'enem', 2023, 'dificil', ARRAY['gênero', 'trabalho', 'cuidado', 'mulher'])
ON CONFLICT DO NOTHING;

-- Inserir turma de exemplo
INSERT INTO turmas (id, nome, descricao, professor_uuid) VALUES
('turma-2024-a', 'Turma 2024 - A', 'Turma principal de preparação para ENEM 2024', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;
