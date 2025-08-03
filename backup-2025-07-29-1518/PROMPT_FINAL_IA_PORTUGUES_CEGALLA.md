# PROMPT FINAL - FLASHCARDS DE PORTUGUÊS (LIVRO CEGALLA)

## CONTEXTO DO BANCO DE DADOS

Você é um especialista em criar flashcards educacionais para um sistema de estudo. O banco de dados possui as seguintes tabelas:

### Estrutura da tabela `flashcards`:
```sql
CREATE TABLE public.flashcards (
  id SERIAL PRIMARY KEY,
  topic_id VARCHAR(255) NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Tópicos disponíveis para Português (JÁ EXISTENTES NA TABELA):
- `sintaxe-termos-integrantes` - Sintaxe: Termos Integrantes
- `regencia` - Regência Verbal e Nominal
- `crase` - Crase
- `morfologia-flexao` - Morfologia: Flexão
- `fonetica-fonologia` - Fonetica e Fonologia
- `acentuacao-grafica` - Acentuação Gráfica
- `ortografia` - Ortografia
- `colocacao-pronominal` - Colocação Pronominal
- `morfologia-classes` - Morfologia: Classes de Palavras
- `semantica-estilistica` - Semântica e Estilística
- `sintaxe-periodo-composto` - Sintaxe: Período Composto
- `sintaxe-termos-acessorios` - Sintaxe: Termos Acessórios
- `sintaxe-termos-essenciais` - Sintaxe: Termos Essenciais
- `concordancia` - Concordância Verbal e Nominal

## FORMATO DE SAÍDA OBRIGATÓRIO

Você deve gerar EXATAMENTE o seguinte formato JSON para cada flashcard:

```json
[
  {
    "id": 1,
    "pergunta": "Qual é a função do artigo na língua portuguesa?",
    "resposta": "O artigo é uma classe gramatical que antecede o substantivo, determinando-o e indicando gênero, número e especificidade.",
    "topico": "Morfologia: Classes de Palavras",
    "tipo": "gramatica",
    "referencia": "Cegalla, p. 45"
  }
]
```

## DIRETRIZES DE CRIAÇÃO

### Campos obrigatórios:
- **id**: Número sequencial único
- **pergunta**: Pergunta clara e específica sobre o conteúdo
- **resposta**: Resposta completa e didática
- **topico**: Um dos tópicos listados acima (use o nome completo, não o ID)
- **tipo**: Sempre "gramatica" para flashcards de português
- **referencia**: Referência ao livro Cegalla (ex: "Cegalla, p. 123")

### Conteúdo específico por tópico:

#### **SINTAXE: TERMOS INTEGRANTES** (15 flashcards)
- Objeto direto e indireto
- Complemento nominal
- Agente da passiva
- Análise sintática detalhada

#### **REGIÊNCIA VERBAL E NOMINAL** (15 flashcards)
- Regência de verbos
- Regência de nomes
- Preposições obrigatórias
- Casos especiais de regência

#### **CRASE** (15 flashcards)
- Uso da crase
- Casos obrigatórios e facultativos
- Exceções e casos especiais
- Identificação da crase

#### **MORFOLOGIA: FLEXÃO** (15 flashcards)
- Flexões nominais
- Flexões verbais
- Flexões pronominais
- Flexões adjetivas

#### **FONÉTICA E FONOLOGIA** (15 flashcards)
- Fonemas e letras
- Sílaba e acentuação
- Encontros consonantais e vocálicos
- Processos fonológicos

#### **ACENTUAÇÃO GRÁFICA** (10 flashcards)
- Regras de acentuação
- Proparoxítonas, paroxítonas, oxítonas
- Acentos diferenciais
- Casos especiais

#### **ORTOGRAFIA** (10 flashcards)
- Uso de letras
- Hífen
- Grafia correta
- Casos especiais

#### **COLOCAÇÃO PRONOMINAL** (10 flashcards)
- Próclise, mesóclise, ênclise
- Regras de colocação
- Casos obrigatórios
- Exceções

#### **MORFOLOGIA: CLASSES DE PALAVRAS** (10 flashcards)
- Substantivo, adjetivo, verbo
- Artigo, pronome, numeral
- Advérbio, preposição, conjunção
- Interjeição

#### **SEMÂNTICA E ESTILÍSTICA** (10 flashcards)
- Sinonímia e antonímia
- Polissemia e homonímia
- Denotação e conotação
- Figuras de linguagem

#### **SINTAXE: PERÍODO COMPOSTO** (10 flashcards)
- Orações coordenadas
- Orações subordinadas
- Tipos de orações
- Análise de períodos

#### **SINTAXE: TERMOS ACESSÓRIOS** (10 flashcards)
- Adjunto adnominal
- Adjunto adverbial
- Aposto
- Vocativo

#### **SINTAXE: TERMOS ESSENCIAIS** (10 flashcards)
- Sujeito
- Predicado
- Tipos de sujeito
- Tipos de predicado

#### **CONCORDÂNCIA VERBAL E NOMINAL** (10 flashcards)
- Concordância verbal
- Concordância nominal
- Casos especiais
- Exceções

## REGRAS IMPORTANTES

1. **NÃO use inglês** - Todo conteúdo deve ser em português brasileiro
2. **Evite duplicatas** - Verifique se a pergunta não é similar a outras já criadas
3. **Seja específico** - Perguntas devem ser claras e diretas
4. **Referência obrigatória** - Sempre inclua referência ao Cegalla
5. **Qualidade didática** - Respostas devem ser educativas e completas
6. **Dificuldade variada** - Inclua perguntas de diferentes níveis de dificuldade
7. **Contexto prático** - Use exemplos práticos quando possível
8. **Use apenas os tópicos listados** - Não invente novos tópicos

## EXEMPLOS DE REFERÊNCIAS

- "Cegalla, p. 45" (para páginas específicas)
- "Cegalla, cap. 3" (para capítulos)
- "Cegalla, Gramática" (para seções gerais)
- "Cegalla, Literatura" (para seções de literatura)

## QUANTIDADE SOLICITADA

Gere **175 flashcards** distribuídos conforme especificado acima:
- Sintaxe: Termos Integrantes: 15
- Regência Verbal e Nominal: 15
- Crase: 15
- Morfologia: Flexão: 15
- Fonética e Fonologia: 15
- Acentuação Gráfica: 10
- Ortografia: 10
- Colocação Pronominal: 10
- Morfologia: Classes de Palavras: 10
- Semântica e Estilística: 10
- Sintaxe: Período Composto: 10
- Sintaxe: Termos Acessórios: 10
- Sintaxe: Termos Essenciais: 10
- Concordância Verbal e Nominal: 10

## CHECKLIST FINAL

Antes de enviar, verifique se:
- [ ] Todos os 175 flashcards estão no formato JSON correto
- [ ] Todos os campos obrigatórios estão preenchidos
- [ ] As referências ao Cegalla estão incluídas
- [ ] O conteúdo está em português brasileiro
- [ ] As perguntas são claras e específicas
- [ ] As respostas são didáticas e completas
- [ ] A distribuição por tópico está correta
- [ ] Não há duplicatas óbvias
- [ ] Usou apenas os tópicos listados acima

## INSTRUÇÃO FINAL

Gere exatamente 175 flashcards de Português baseados no livro Cegalla, seguindo rigorosamente este formato e diretrizes. Use APENAS os tópicos listados acima que já existem na tabela. Foque na qualidade didática e na precisão das informações gramaticais. 