# Template para IA Gerar Flashcards de Português

## 📋 Instruções para a IA

Preciso que você gere flashcards de Português para um sistema de estudos. Os flashcards devem seguir exatamente este formato para importação no Supabase.

## 🗄️ Estrutura do Banco de Dados

### Tabela `topics`:
- `id` (text) - ID único do tópico
- `name` (text) - Nome do tópico
- `user_uuid` (uuid, nullable) - UUID do usuário
- `subject_id` (integer, nullable) - ID da matéria

### Tabela `flashcards`:
- `id` (integer, auto-increment) - ID único do flashcard
- `topic_id` (text) - ID do tópico (referência à tabela topics)
- `question` (text) - Pergunta do flashcard
- `answer` (text) - Resposta do flashcard

## 📚 Tópicos Disponíveis

Use apenas estes IDs de tópicos:

### Gramática:
- `fonetica-fonologia` - Fonetica e Fonologia
- `ortografia` - Ortografia
- `acentuacao-grafica` - Acentuação Gráfica
- `morfologia-classes` - Morfologia: Classes de Palavras
- `morfologia-flexao` - Morfologia: Flexão
- `sintaxe-termos-essenciais` - Sintaxe: Termos Essenciais
- `sintaxe-termos-integrantes` - Sintaxe: Termos Integrantes
- `sintaxe-termos-acessorios` - Sintaxe: Termos Acessórios
- `sintaxe-periodo-composto` - Sintaxe: Período Composto
- `concordancia` - Concordância Verbal e Nominal

### Regência e Crase:
- `regencia-verbal-nominal` - Regência Verbal e Nominal
- `crase` - Crase
- `colocacao-pronominal` - Colocação Pronominal

### Semântica:
- `semantica-estilistica` - Semântica e Estilística

## 📝 Formato de Saída

Gere os flashcards no seguinte formato JSON:

```json
[
  {
    "topic_id": "fonetica-fonologia",
    "question": "O que é um fonema?",
    "answer": "Fonema é a menor unidade sonora distintiva de uma língua, capaz de diferenciar significados entre palavras."
  },
  {
    "topic_id": "ortografia",
    "question": "Qual a diferença entre 'mas' e 'mais'?",
    "answer": "'Mas' é uma conjunção adversativa (ex: 'Estudou, mas não passou'). 'Mais' é um advérbio de intensidade ou numeral (ex: 'Ele tem mais livros')."
  }
]
```

## 🎯 Diretrizes para Criação

### Para cada tópico, crie flashcards que:
1. **Sejam específicos** do conteúdo gramatical
2. **Tenham perguntas claras** e diretas
3. **Forneçam respostas completas** e didáticas
4. **Sigam a progressão** do básico ao avançado
5. **Incluam exemplos** quando relevante

### Exemplos de Estilo:
- **Pergunta**: "O que é um ditongo?"
- **Resposta**: "Ditongo é o encontro de uma vogal com uma semivogal na mesma sílaba. Exemplos: 'cau-sa', 'rei-no', 'pai-xão'."

## 📊 Quantidade por Tópico

Gere aproximadamente:
- **Fonetica e Fonologia**: 20 flashcards
- **Ortografia**: 25 flashcards
- **Acentuação Gráfica**: 20 flashcards
- **Morfologia**: 30 flashcards (15 por subdivisão)
- **Sintaxe**: 40 flashcards (10 por subdivisão)
- **Concordância**: 15 flashcards
- **Regência**: 20 flashcards
- **Crase**: 20 flashcards
- **Colocação Pronominal**: 15 flashcards
- **Semântica**: 15 flashcards

**Total**: ~220 flashcards

## 🔧 Script SQL para Importação

Após receber os flashcards em JSON, use este script para importar:

```sql
-- Script para importar flashcards gerados pela IA
INSERT INTO public.flashcards (topic_id, question, answer)
VALUES 
  ('topic_id_aqui', 'pergunta_aqui', 'resposta_aqui'),
  ('topic_id_aqui', 'pergunta_aqui', 'resposta_aqui');
```

## 📋 Checklist para a IA

- [ ] Usar apenas os topic_id listados acima
- [ ] Gerar perguntas claras e específicas
- [ ] Fornecer respostas completas e didáticas
- [ ] Seguir o formato JSON exato
- [ ] Incluir exemplos quando relevante
- [ ] Manter consistência terminológica
- [ ] Focar em conteúdo de nível médio a avançado
- [ ] Evitar duplicatas de perguntas existentes

---

**Por favor, gere os flashcards seguindo exatamente este template e formato!** 