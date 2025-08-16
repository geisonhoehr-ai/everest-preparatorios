# Template Atualizado para IA Gerar Flashcards de Português

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

## 📚 Tópicos Disponíveis (DADOS REAIS DO BANCO)

Use apenas estes IDs de tópicos (baseado na estrutura real do banco):

### Gramática Português:
- `fonetica-fonologia` - Fonetica e Fonologia (50 flashcards atuais)
- `ortografia` - Ortografia (31 flashcards atuais)
- `acentuacao-grafica` - Acentuação Gráfica (31 flashcards atuais)
- `morfologia-classes` - Morfologia: Classes de Palavras (30 flashcards atuais)
- `morfologia-flexao` - Morfologia: Flexão (62 flashcards atuais)
- `sintaxe-termos-essenciais` - Sintaxe: Termos Essenciais (30 flashcards atuais)
- `sintaxe-termos-integrantes` - Sintaxe: Termos Integrantes (80 flashcards atuais)
- `sintaxe-termos-acessorios` - Sintaxe: Termos Acessórios (30 flashcards atuais)
- `sintaxe-periodo-composto` - Sintaxe: Período Composto (30 flashcards atuais)
- `concordancia` - Concordância Verbal e Nominal (11 flashcards atuais)

### Regência e Crase:
- `regencia` - Regência Verbal e Nominal (63 flashcards atuais)
- `crase` - Crase (62 flashcards atuais)
- `colocacao-pronominal` - Colocação Pronominal (30 flashcards atuais)

### Semântica:
- `semantica-estilistica` - Semântica e Estilística (30 flashcards atuais)

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
6. **NÃO sejam duplicatas** dos flashcards existentes

### Exemplos de Estilo:
- **Pergunta**: "O que é um ditongo?"
- **Resposta**: "Ditongo é o encontro de uma vogal com uma semivogal na mesma sílaba. Exemplos: 'cau-sa', 'rei-no', 'pai-xão'."

## 📊 Quantidade por Tópico (SUGESTÃO)

Baseado nos dados atuais, sugiro gerar:

### Tópicos com poucos flashcards (prioridade alta):
- **Concordância**: +20 flashcards (atualmente tem 11)
- **Ortografia**: +15 flashcards (atualmente tem 31)
- **Acentuação Gráfica**: +15 flashcards (atualmente tem 31)

### Tópicos com quantidade média (prioridade média):
- **Fonetica e Fonologia**: +10 flashcards (atualmente tem 50)
- **Morfologia: Classes**: +10 flashcards (atualmente tem 30)
- **Sintaxe: Termos Essenciais**: +10 flashcards (atualmente tem 30)
- **Sintaxe: Termos Acessórios**: +10 flashcards (atualmente tem 30)
- **Sintaxe: Período Composto**: +10 flashcards (atualmente tem 30)
- **Colocação Pronominal**: +10 flashcards (atualmente tem 30)
- **Semântica**: +10 flashcards (atualmente tem 30)

### Tópicos com muitos flashcards (prioridade baixa):
- **Sintaxe: Termos Integrantes**: +5 flashcards (atualmente tem 80)
- **Regência**: +5 flashcards (atualmente tem 63)
- **Crase**: +5 flashcards (atualmente tem 62)
- **Morfologia: Flexão**: +5 flashcards (atualmente tem 62)

**Total sugerido**: ~150 flashcards novos

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
- [ ] **EVITAR duplicatas** dos flashcards existentes
- [ ] **Priorizar tópicos** com menos flashcards

## 🚨 IMPORTANTE

**NÃO gere flashcards para estes tópicos** (são de outras matérias):
- `lei-13954-2019`
- `portaria-gm-md-1143-2022`
- `rca-34-1`
- `rdaer`
- `estatuto-militares`
- `ica-111-1`
- `ica-111-2`
- `ica-111-3`
- `ica-111-6`
- `regulamentos-comuns`

**Foque apenas nos tópicos de Português/Gramática listados acima!**

---

**Por favor, gere os flashcards seguindo exatamente este template e formato!** 