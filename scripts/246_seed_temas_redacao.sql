-- Script para inserir dados de teste na tabela temas_redacao

-- Inserir temas de redação de teste
INSERT INTO temas_redacao (titulo, descricao, tipo_prova, ano, dificuldade, tags) VALUES
(
    'A importância da educação na sociedade contemporânea',
    'Disserte sobre o papel fundamental da educação no desenvolvimento social e individual, considerando os desafios da era digital.',
    'enem',
    2024,
    'medio',
    ARRAY['educação', 'sociedade', 'tecnologia']
),
(
    'Os desafios da sustentabilidade ambiental',
    'Analise os principais desafios enfrentados pela humanidade em relação à preservação ambiental e as possíveis soluções.',
    'enem',
    2024,
    'medio',
    ARRAY['meio ambiente', 'sustentabilidade', 'poluição']
),
(
    'O impacto das redes sociais na comunicação',
    'Discuta como as redes sociais transformaram a forma como nos comunicamos e relacionamos na sociedade atual.',
    'enem',
    2024,
    'facil',
    ARRAY['tecnologia', 'comunicação', 'redes sociais']
),
(
    'A valorização da diversidade cultural no Brasil',
    'Reflita sobre a importância de reconhecer e valorizar a diversidade cultural presente em nosso país.',
    'enem',
    2024,
    'medio',
    ARRAY['cultura', 'diversidade', 'brasil']
),
(
    'O papel da ciência no combate à pandemia',
    'Analise como o desenvolvimento científico foi fundamental para enfrentar os desafios da pandemia de COVID-19.',
    'enem',
    2024,
    'dificil',
    ARRAY['ciência', 'saúde', 'pandemia']
)
ON CONFLICT (id) DO NOTHING;

-- Verificar temas inseridos
SELECT 
    id,
    titulo,
    tipo_prova,
    dificuldade,
    tags
FROM temas_redacao 
ORDER BY id; 