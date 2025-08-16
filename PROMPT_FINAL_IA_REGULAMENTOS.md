# PROMPT FINAL PARA IA - FLASHCARDS DE REGULAMENTOS MILITARES

## 🎯 INSTRUÇÕES PARA A IA

Você é um especialista em regulamentos militares brasileiros. Preciso que você gere flashcards de estudo para um sistema de preparação para concursos militares.

## 📊 DADOS ATUAIS DO BANCO

**Status atual**: 75 flashcards distribuídos em 10 tópicos
- **Regulamentos Gerais**: 45 flashcards (5 tópicos)
- **Regulamentos FAB**: 30 flashcards (5 tópicos)

## 🗄️ ESTRUTURA DO BANCO

### Tabela `flashcards`:
- `id` (integer, auto-increment)
- `topic_id` (text) - ID do tópico
- `question` (text) - Pergunta
- `answer` (text) - Resposta

## 📚 TÓPICOS DISPONÍVEIS

### 🎯 REGULAMENTOS GERAIS (Aplicam-se a todas as Forças):
- `estatuto-militares` - Estatuto dos Militares (Lei nº 6.880/1980)
- `lei-13954-2019` - Lei 13.954/2019 (Processo Administrativo Disciplinar)
- `portaria-gm-md-1143-2022` - Portaria GM-MD Nº 1.143/2022 (Continências)
- `rca-34-1` - RCA 34-1 (Regulamento de Continências)
- `regulamentos-comuns` - Regulamentos Comuns (Normas unificadas)

### 🛩️ REGULAMENTOS ESPECÍFICOS DA FAB:
- `rdaer` - RDAER (Regulamento de Disciplina da Aeronáutica)
- `ica-111-1` - ICA 111-1 (Instruções do Comando da Aeronáutica)
- `ica-111-2` - ICA 111-2 (Procedimentos operacionais da FAB)
- `ica-111-3` - ICA 111-3 (Normas técnicas da Aeronáutica)
- `ica-111-6` - ICA 111-6 (Organização e procedimentos da FAB)

## 📝 FORMATO DE SAÍDA OBRIGATÓRIO

Gere EXATAMENTE neste formato JSON:

```json
[
  {
    "id": 1,
    "pergunta": "O que é disciplina, segundo o Regulamento Disciplinar da Aeronáutica (RDAer)?",
    "resposta": "Disciplina é a rigorosa observância e o acatamento integral das leis, regulamentos, normas e disposições que fundamentam a organização militar e o exercício da autoridade.",
    "topico": "Regulamento Disciplinar da Aeronáutica",
    "tipo": "FAB",
    "referencia": "RDAer, art. 2º"
  },
  {
    "id": 2,
    "pergunta": "Qual é o conceito de hierarquia militar conforme o Estatuto dos Militares?",
    "resposta": "Hierarquia militar é a ordenação da autoridade em níveis diferentes dentro da estrutura das Forças Armadas, conforme o posto ou graduação.",
    "topico": "Estatuto dos Militares",
    "tipo": "geral",
    "referencia": "Lei nº 6.880/1980, art. 14"
  }
]
```

## 🎯 DIRETRIZES DE CRIAÇÃO

### Para cada flashcard:
1. **Perguntas claras e específicas** sobre o conteúdo regulamentar
2. **Respostas completas e didáticas** com explicações detalhadas
3. **Progressão do básico ao avançado** dentro de cada tópico
4. **Incluir exemplos práticos** quando relevante
5. **Referenciar artigos das leis** quando apropriado
6. **Usar linguagem técnica militar** correta
7. **EVITAR duplicatas** dos flashcards existentes

### Campos obrigatórios:
- **id**: Número sequencial (1, 2, 3...)
- **pergunta**: Pergunta clara e específica
- **resposta**: Resposta completa e didática
- **topico**: Nome completo do tópico
- **tipo**: "geral" ou "FAB"
- **referencia**: Referência legal quando aplicável

## 📊 QUANTIDADE SOLICITADA

### Regulamentos Gerais (PRIORIDADE ALTA):
- **Estatuto dos Militares**: +15 flashcards
- **Lei 13.954/2019**: +15 flashcards  
- **Portaria GM-MD 1.143/2022**: +15 flashcards
- **RCA 34-1**: +15 flashcards
- **Regulamentos Comuns**: +15 flashcards

### Regulamentos FAB (PRIORIDADE MÉDIA):
- **RDAER**: +20 flashcards
- **ICA 111-1**: +20 flashcards
- **ICA 111-2**: +20 flashcards
- **ICA 111-3**: +20 flashcards
- **ICA 111-6**: +20 flashcards

**TOTAL SOLICITADO**: 175 flashcards novos

## 🎯 CONTEÚDO ESPECÍFICO POR TÓPICO

### Estatuto dos Militares (GERAL):
- Hierarquia e disciplina militar
- Direitos e deveres dos militares
- Promoções e carreira militar
- Punições e processos disciplinares
- Organização das Forças Armadas
- Artigos específicos da Lei nº 6.880/1980

### Lei 13.954/2019 (GERAL):
- Processo administrativo disciplinar
- Infrações disciplinares (leves, médias, graves)
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

## 🚨 REGRAS IMPORTANTES

### NÃO gere flashcards para estes tópicos (são de Português/Gramática):
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

### Foque APENAS nos tópicos de Regulamentos Militares listados acima!

## 📋 CHECKLIST FINAL

- [ ] Usar apenas os topic_id listados
- [ ] Gerar perguntas claras e específicas
- [ ] Fornecer respostas completas e didáticas
- [ ] Seguir o formato JSON exato com todos os campos
- [ ] Incluir exemplos quando relevante
- [ ] Manter consistência terminológica
- [ ] Focar em conteúdo de nível médio a avançado
- [ ] EVITAR duplicatas dos flashcards existentes
- [ ] Priorizar regulamentos FAB (menos flashcards atualmente)
- [ ] Usar linguagem técnica apropriada para militares
- [ ] Incluir referências aos artigos das leis quando relevante
- [ ] Distinguir claramente regulamentos gerais vs. específicos da FAB
- [ ] Preencher todos os campos: id, pergunta, resposta, topico, tipo, referencia

## 🎯 DIFERENCIAÇÃO POR CONCURSO

### Para concursos da FAB:
- Estudar TODOS os 10 tópicos (gerais + específicos)

### Para concursos do Exército/Marinha:
- Estudar apenas os 5 tópicos GERAIS

## 📝 EXEMPLOS DE REFERÊNCIAS

### Para regulamentos gerais:
- "Lei nº 6.880/1980, art. X"
- "Lei 13.954/2019, art. X"
- "Portaria GM-MD 1.143/2022, art. X"
- "RCA 34-1, art. X"

### Para regulamentos FAB:
- "RDAer, art. X"
- "ICA 111-1, art. X"
- "ICA 111-2, art. X"
- "ICA 111-3, art. X"
- "ICA 111-6, art. X"

---

**GERE EXATAMENTE 175 FLASHCARDS NO FORMATO JSON ESPECIFICADO ACIMA!** 