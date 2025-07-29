# Template para IA Gerar Flashcards de Regulamentos Militares

## 📋 Instruções para a IA

Preciso que você gere flashcards de Regulamentos Militares para um sistema de estudos. Os flashcards devem seguir exatamente este formato para importação no Supabase.

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

**Status atual**: 75 flashcards distribuídos em 10 tópicos

### 🎯 REGULAMENTOS GERAIS (Aplicam-se a todas as Forças Armadas):

- `estatuto-militares` - Estatuto dos Militares (Lei nº 6.880/1980)
- `lei-13954-2019` - Lei 13.954/2019 (Processo Administrativo Disciplinar)
- `portaria-gm-md-1143-2022` - Portaria GM-MD Nº 1.143/2022 (Continências)
- `rca-34-1` - RCA 34-1 (Regulamento de Continências)
- `regulamentos-comuns` - Regulamentos Comuns (Normas unificadas)

### 🛩️ REGULAMENTOS ESPECÍFICOS DA FAB (Força Aérea Brasileira):

- `rdaer` - RDAER (Regulamento de Disciplina da Aeronáutica)
- `ica-111-1` - ICA 111-1 (Instruções do Comando da Aeronáutica)
- `ica-111-2` - ICA 111-2 (Procedimentos operacionais da FAB)
- `ica-111-3` - ICA 111-3 (Normas técnicas da Aeronáutica)
- `ica-111-6` - ICA 111-6 (Organização e procedimentos da FAB)

## 📝 Formato de Saída

Gere os flashcards no seguinte formato JSON:

```json
[
  {
    "topic_id": "estatuto-militares",
    "question": "O que é o Estatuto dos Militares?",
    "answer": "O Estatuto dos Militares (Lei nº 6.880/1980) é a lei que regula os direitos, deveres e responsabilidades dos militares das Forças Armadas."
  },
  {
    "topic_id": "lei-13954-2019",
    "question": "Qual o objetivo da Lei 13.954/2019?",
    "answer": "A Lei 13.954/2019 estabelece normas gerais sobre o processo administrativo disciplinar militar e outras disposições relacionadas à disciplina militar."
  }
]
```

## 🎯 Diretrizes para Criação

### Para cada tópico, crie flashcards que:
1. **Sejam específicos** do conteúdo regulamentar
2. **Tenham perguntas claras** e diretas
3. **Forneçam respostas completas** e didáticas
4. **Sigam a progressão** do básico ao avançado
5. **Incluam exemplos** quando relevante
6. **NÃO sejam duplicatas** dos flashcards existentes

### Exemplos de Estilo:
- **Pergunta**: "Quais são os princípios da hierarquia militar?"
- **Resposta**: "Os princípios da hierarquia militar são: autoridade, responsabilidade, disciplina e respeito. A hierarquia garante a organização e eficiência das Forças Armadas."

## 📊 Quantidade por Tópico (SUGESTÃO BASEADA NOS DADOS REAIS)

**Status atual**: ~7-8 flashcards por tópico (75 total)

### Tópicos principais (prioridade alta) - REGULAMENTOS GERAIS:
- **Estatuto dos Militares**: +15 flashcards (atualmente ~7-8)
- **Lei 13.954/2019**: +15 flashcards (atualmente ~7-8)
- **Portaria GM-MD 1.143/2022**: +15 flashcards (atualmente ~7-8)
- **RCA 34-1**: +15 flashcards (atualmente ~7-8)
- **Regulamentos Comuns**: +15 flashcards (atualmente ~7-8)

### Tópicos específicos (prioridade média) - FAB:
- **RDAER**: +20 flashcards (atualmente ~7-8)
- **ICA 111-1**: +20 flashcards (atualmente ~7-8)
- **ICA 111-2**: +20 flashcards (atualmente ~7-8)
- **ICA 111-3**: +20 flashcards (atualmente ~7-8)
- **ICA 111-6**: +20 flashcards (atualmente ~7-8)

**Total sugerido**: ~175 flashcards novos (para chegar a ~250 total)

## 🎯 Conteúdo Específico por Tópico

### Estatuto dos Militares (GERAL):
- Hierarquia e disciplina militar
- Direitos e deveres dos militares
- Promoções e carreira militar
- Punições e processos disciplinares
- Organização das Forças Armadas
- Estatuto dos Militares (Lei nº 6.880/1980)

### Lei 13.954/2019 (GERAL):
- Processo administrativo disciplinar
- Infrações disciplinares
- Medidas disciplinares
- Procedimentos administrativos
- Recursos e prazos
- Aplicação em todas as Forças

### Portaria GM-MD 1.143/2022 (GERAL):
- Continências e sinais de respeito
- Cerimônias militares
- Precedência entre Forças
- Padronização de procedimentos
- Protocolo militar unificado

### RCA 34-1 (GERAL):
- Regulamento de Continências
- Sinais de respeito
- Apresentação de armas
- Toques de corneta
- Procedimentos cerimoniais

### Regulamentos Comuns (GERAL):
- Integração entre Forças
- Normas comuns
- Procedimentos padronizados
- Hierarquia interforças
- Disciplina unificada

### RDAER (ESPECÍFICO FAB):
- Regulamento de Disciplina da Aeronáutica
- Infrações específicas da FAB
- Processos disciplinares da Aeronáutica
- Hierarquia da FAB
- Disciplina específica da aviação
- Aplicação exclusiva na FAB

### ICA 111-1, 111-2, 111-3, 111-6 (ESPECÍFICO FAB):
- Instruções específicas do Comando da Aeronáutica
- Procedimentos operacionais da FAB
- Normas técnicas da Aeronáutica
- Organização da FAB
- Especificidades da aviação militar
- Aplicação exclusiva na FAB

## 🔧 Script SQL para Importação

Após receber os flashcards em JSON, use este script para importar:

```sql
-- Script para importar flashcards de regulamentos gerados pela IA
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
- [ ] **Usar linguagem técnica** apropriada para militares
- [ ] **Incluir referências** aos artigos das leis quando relevante
- [ ] **Distinguir claramente** regulamentos gerais vs. específicos da FAB

## 🚨 IMPORTANTE

**NÃO gere flashcards para estes tópicos** (são de Português/Gramática):
- `fonetica-fonologia`
- `ortografia`
- `acentuacao-grafica`
- `morfologia-classes`
- `morfologia-flexao`
- `sintaxe-termos-essenciais`
- `sintaxe-termos-integrantes`
- `sintaxe-termos-acessorios`
- `sintaxe-periodo-composto`
- `concordancia`
- `regencia`
- `crase`
- `colocacao-pronominal`
- `semantica-estilistica`

**Foque apenas nos tópicos de Regulamentos Militares listados acima!**

## 📊 DIFERENCIAÇÃO POR CONCURSO

### Para concursos da FAB:
- **Estudar TODOS os 10 tópicos** (gerais + específicos)

### Para concursos do Exército/Marinha:
- **Estudar apenas os 5 tópicos GERAIS**:
  - `estatuto-militares`
  - `lei-13954-2019`
  - `portaria-gm-md-1143-2022`
  - `rca-34-1`
  - `regulamentos-comuns`

---

**Por favor, gere os flashcards seguindo exatamente este template e formato!** 