-- Inserir tópicos (se não existirem)
INSERT INTO topics (id, name) VALUES
('fonetica-fonologia', 'Fonetica e Fonologia'),
('ortografia', 'Ortografia'),
('acentuacao-grafica', 'Acentuação Gráfica'),
('morfologia-classes', 'Morfologia: Classes de Palavras'),
('morfologia-flexao', 'Morfologia: Flexão'),
('sintaxe-termos-essenciais', 'Sintaxe: Termos Essenciais'),
('sintaxe-termos-integrantes', 'Sintaxe: Termos Integrantes'),
('sintaxe-termos-acessorios', 'Sintaxe: Termos Acessórios'),
('sintaxe-periodo-composto', 'Sintaxe: Período Composto'),
('concordancia', 'Concordância Verbal e Nominal'),
('regencia', 'Regência Verbal e Nominal'),
('crase', 'Crase'),
('colocacao-pronominal', 'Colocação Pronominal'),
('semantica-estilistica', 'Semântica e Estilística')
ON CONFLICT (id) DO NOTHING;

-- Inserir flashcards (apenas alguns exemplos para cada tópico)
-- Você pode expandir esta lista com todos os seus 160+ flashcards
INSERT INTO flashcards (topic_id, question, answer) VALUES
('fonetica-fonologia', 'O que é um fonema?', 'Menor unidade sonora da fala que distingue significados.'),
('fonetica-fonologia', 'O que é um ditongo?', 'Encontro de duas vogais em uma mesma sílaba.'),
('ortografia', 'Qual a diferença entre ''mas'' e ''mais''?', '''Mas'' é conjunção adversativa; ''mais'' é advérbio de intensidade.'),
('acentuacao-grafica', 'Quando acentuar oxítonas?', 'Terminadas em A(s), E(s), O(s), EM, ENS.'),
('morfologia-classes', 'O que é um substantivo?', 'Palavra que nomeia seres, objetos, lugares, sentimentos, etc.'),
('sintaxe-termos-essenciais', 'O que é sujeito simples?', 'Apresenta apenas um núcleo.'),
('sintaxe-termos-integrantes', 'O que é objeto direto?', 'Complemento verbal sem preposição.'),
('sintaxe-termos-acessorios', 'O que é adjunto adnominal?', 'Termo que acompanha o substantivo, caracterizando-o.'),
('sintaxe-periodo-composto', 'O que é uma oração coordenada assindética?', 'Oração coordenada sem conjunção.'),
('concordancia', 'Qual a regra geral de concordância verbal?', 'O verbo concorda em número e pessoa com o sujeito.'),
('regencia', 'Qual a regência do verbo ''assistir'' no sentido de ''ver''?', 'Verbo transitivo indireto, exige preposição ''a''.'),
('crase', 'Quando ocorre a crase?', 'Fusão da preposição ''a'' com o artigo feminino ''a(s)'' ou com pronomes demonstrativos ''a'', ''aquilo'', ''aquela''.'),
('colocacao-pronominal', 'O que é próclise?', 'Pronome oblíquo átono antes do verbo.'),
('semantica-estilistica', 'O que é sinonímia?', 'Relação entre palavras de sentido semelhante.')
ON CONFLICT DO NOTHING; -- Evita duplicatas se o script for rodado várias vezes

-- Inserir pontuação inicial para o usuário temporário (se não existir)
INSERT INTO user_scores (user_id, total_score) VALUES (1, 0)
ON CONFLICT (user_id) DO NOTHING;
