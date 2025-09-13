-- Inserir cronograma completo do EAOF 2026 na tabela calendar_events
-- Este script insere todos os eventos do cronograma extensivo EAOF 2026

-- Primeiro, vamos limpar eventos antigos do EAOF 2026 (opcional)
-- DELETE FROM calendar_events WHERE title LIKE '%EAOF%' OR title LIKE '%Mentoria%' OR title LIKE '%Simulado%';

-- Inserir eventos do cronograma EAOF 2026
INSERT INTO calendar_events (title, description, event_date, event_time, event_type, duration_minutes, instructor, location, is_mandatory, max_participants) VALUES

-- MENTORIAS
('Mentoria 01 - Aula Inaugural', 'Aula inaugural do curso EAOF 2026', '2026-05-26', '19:00:00', 'mentoria', 120, 'Equipe Everest', 'Sala Virtual', true, 100),
('Mentoria 02 - Acentuação Gráfica, Ortografia, Estrutura e Formação', 'Revisão completa de acentuação gráfica e ortografia', '2026-06-02', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 03 - Substantivo, Adjetivo e Artigo', 'Estudo detalhado de substantivos, adjetivos e artigos', '2026-06-16', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 04 - Pronomes, Numeral, Advérbio e Preposição', 'Revisão de pronomes, numerais, advérbios e preposições', '2026-06-30', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 05 - Conjunções', 'Estudo completo das conjunções', '2026-07-14', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 06 - Verbo', 'Revisão detalhada de verbos', '2026-08-11', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 07 - Sintaxe: Período Simples', 'Estudo da sintaxe do período simples', '2026-08-25', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 08 - Período Composto e Pontuação', 'Sintaxe do período composto e pontuação', '2026-09-22', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 09 - Sintaxe de Colocação de Concordância', 'Concordância verbal e nominal', '2026-10-06', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 10 - Regência e Crase', 'Regência verbal, nominal e uso da crase', '2026-11-03', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 11 - Compreensão Interpretação', 'Técnicas de compreensão e interpretação de texto', '2026-11-17', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 12 - Tipos e Gêneros', 'Tipos textuais e gêneros literários', '2026-12-01', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 13 - Coesão e Coerência', 'Elementos de coesão e coerência textual', '2026-12-15', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 14 - Denotação, Conotação e Análise do Discurso', 'Denotação, conotação e análise do discurso', '2027-01-12', '19:00:00', 'mentoria', 120, 'Prof. Português', 'Sala Virtual', true, 100),
('Mentoria 15 - Live Final', 'Aula final de revisão geral', '2027-01-26', '19:00:00', 'mentoria', 120, 'Equipe Everest', 'Sala Virtual', true, 100),

-- SIMULADOS
('Simulado 01 - Diagnóstico', 'Simulado diagnóstico para avaliar conhecimentos iniciais', '2026-05-29', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 02 - Conteúdo das Mentorias 2 e 3', 'Simulado sobre acentuação, ortografia, substantivos e adjetivos', '2026-06-28', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 03 - Conteúdo das Mentorias 2, 3, 4 e 5', 'Simulado sobre morfologia completa', '2026-07-29', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 04 - Conteúdo das Mentorias 2, 3, 4, 5 e 6', 'Simulado sobre morfologia e verbos', '2026-08-29', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 05 - Conteúdo das Mentorias 2, 3, 4, 5, 6, 7 e 8', 'Simulado sobre morfologia e sintaxe básica', '2026-09-28', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 06 - Conteúdo das Mentorias 2, 3, 4, 5, 6, 7, 8 e 9', 'Simulado sobre morfologia, sintaxe e concordância', '2026-10-29', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 07 - Conteúdo das Mentorias 2 a 11', 'Simulado sobre morfologia, sintaxe e interpretação', '2026-11-28', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 08 - Conteúdo das Mentorias 2 a 13', 'Simulado sobre todo conteúdo até coesão e coerência', '2026-12-29', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 09 - Conteúdo das Mentorias 2 a 14', 'Simulado sobre todo conteúdo até análise do discurso', '2027-01-29', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),
('Simulado 10 - TODO CONTEÚDO', 'Simulado final com todo o conteúdo do curso', '2027-02-15', '14:00:00', 'simulado', 240, 'Equipe Everest', 'Sala Virtual', true, 100),

-- RESOLUÇÕES
('Resolução 01 - Simulado Diagnóstico', 'Resolução comentada do simulado diagnóstico', '2026-05-31', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),
('Resolução 02 - Simulado Mentorias 2 e 3', 'Resolução comentada do simulado 02', '2026-06-29', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),
('Resolução 03 - Simulado Mentorias 2 a 5', 'Resolução comentada do simulado 03', '2026-07-31', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),
('Resolução 04 - Simulado Mentorias 2 a 6', 'Resolução comentada do simulado 04', '2026-08-31', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),
('Resolução 05 - Simulado Mentorias 2 a 8', 'Resolução comentada do simulado 05', '2026-09-30', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),
('Resolução 06 - Simulado Mentorias 2 a 9', 'Resolução comentada do simulado 06', '2026-10-31', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),
('Resolução 07 - Simulado Mentorias 2 a 11', 'Resolução comentada do simulado 07', '2026-11-30', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),
('Resolução 08 - Simulado Mentorias 2 a 13', 'Resolução comentada do simulado 08', '2026-12-31', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),
('Resolução 09 - Simulado Mentorias 2 a 14', 'Resolução comentada do simulado 09', '2027-01-31', '19:00:00', 'resolucao', 120, 'Equipe Everest', 'Sala Virtual', false, 100),

-- ENTREGAS DE REDAÇÃO
('Entrega TEMA 01', 'Entrega da redação do tema 01', '2026-06-15', '23:59:00', 'entrega', 0, 'Prof. Redação', 'Plataforma', true, 100),
('Recebimento TEMA 01', 'Recebimento da correção da redação tema 01', '2026-06-22', '18:00:00', 'recebimento', 0, 'Prof. Redação', 'Plataforma', false, 100),
('Entrega TEMA 02', 'Entrega da redação do tema 02', '2026-07-15', '23:59:00', 'entrega', 0, 'Prof. Redação', 'Plataforma', true, 100),
('Recebimento TEMA 02', 'Recebimento da correção da redação tema 02', '2026-07-22', '18:00:00', 'recebimento', 0, 'Prof. Redação', 'Plataforma', false, 100),
('Entrega TEMA 03', 'Entrega da redação do tema 03', '2026-08-15', '23:59:00', 'entrega', 0, 'Prof. Redação', 'Plataforma', true, 100),
('Recebimento TEMA 03', 'Recebimento da correção da redação tema 03', '2026-08-22', '18:00:00', 'recebimento', 0, 'Prof. Redação', 'Plataforma', false, 100),
('Entrega TEMA 04', 'Entrega da redação do tema 04', '2026-09-15', '23:59:00', 'entrega', 0, 'Prof. Redação', 'Plataforma', true, 100),
('Recebimento TEMA 04', 'Recebimento da correção da redação tema 04', '2026-09-22', '18:00:00', 'recebimento', 0, 'Prof. Redação', 'Plataforma', false, 100),
('Entrega TEMA 05', 'Entrega da redação do tema 05', '2026-10-15', '23:59:00', 'entrega', 0, 'Prof. Redação', 'Plataforma', true, 100),
('Recebimento TEMA 05', 'Recebimento da correção da redação tema 05', '2026-10-22', '18:00:00', 'recebimento', 0, 'Prof. Redação', 'Plataforma', false, 100);

-- Comentários sobre os eventos inseridos
COMMENT ON TABLE calendar_events IS 'Tabela atualizada com cronograma completo do EAOF 2026';

-- Verificar quantos eventos foram inseridos
SELECT 
  event_type,
  COUNT(*) as total_eventos
FROM calendar_events 
WHERE title LIKE '%EAOF%' 
   OR title LIKE '%Mentoria%' 
   OR title LIKE '%Simulado%' 
   OR title LIKE '%Resolução%'
   OR title LIKE '%TEMA%'
GROUP BY event_type
ORDER BY event_type;
