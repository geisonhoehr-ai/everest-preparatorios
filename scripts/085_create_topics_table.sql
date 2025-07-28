-- Script para verificar e criar a tabela topics se necessário

-- Verificar se a tabela topics existe
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'topics';

-- Se a tabela não existir, criar
CREATE TABLE IF NOT EXISTS public.topics (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  subject_id INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir tópicos básicos se a tabela estiver vazia
INSERT INTO public.topics (id, name, description) VALUES
('fonetica-fonologia', 'Fonética e Fonologia', 'Estudo dos sons da língua'),
('ortografia', 'Ortografia', 'Regras de escrita'),
('acentuacao-grafica', 'Acentuação Gráfica', 'Regras de acentuação'),
('morfologia-classes', 'Morfologia - Classes Gramaticais', 'Estudo das classes de palavras'),
('sintaxe-termos-essenciais', 'Sintaxe - Termos Essenciais', 'Sujeito e predicado'),
('sintaxe-termos-integrantes', 'Sintaxe - Termos Integrantes', 'Objetos e complementos'),
('sintaxe-termos-acessorios', 'Sintaxe - Termos Acessórios', 'Adjuntos e apostos'),
('sintaxe-periodo-composto', 'Sintaxe - Período Composto', 'Orações coordenadas e subordinadas'),
('concordancia', 'Concordância', 'Regras de concordância'),
('regencia', 'Regência', 'Regras de regência'),
('crase', 'Crase', 'Uso da crase'),
('colocacao-pronominal', 'Colocação Pronominal', 'Posição dos pronomes'),
('semantica-estilistica', 'Semântica e Estilística', 'Significado e estilo')
ON CONFLICT (id) DO NOTHING;

-- Verificar se os tópicos foram inseridos
SELECT id, name FROM public.topics ORDER BY name;

-- Verificar se há flashcards para cada tópico
SELECT 
  t.id,
  t.name,
  COUNT(f.id) as flashcard_count
FROM public.topics t
LEFT JOIN public.flashcards f ON t.id = f.topic_id
GROUP BY t.id, t.name
ORDER BY t.name; 