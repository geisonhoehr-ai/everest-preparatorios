# 📅 Guia do Cronograma EAOF 2026

## 🎯 **Como Inserir o Cronograma Completo na Página de Calendário**

### **Opção 1: Importação Automática (Recomendada)**

1. **Acesse a página de Calendário** como professor ou administrador
2. **Clique no botão "Importar Cronograma"** na seção de importação
3. **Aguarde a importação** - o sistema criará automaticamente todos os 44 eventos
4. **Visualize o cronograma** organizado por abas (Mentorias, Simulados, Resoluções, etc.)

### **Opção 2: Execução Manual do Script SQL**

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o script**: `insert-eaof-2026-cronograma.sql`
4. **Verifique os eventos** na tabela `calendar_events`

## 📊 **Conteúdo do Cronograma EAOF 2026**

### **📚 Mentorias (15 eventos)**
- **Mentoria 01**: Aula Inaugural - 26/05/2026
- **Mentoria 02**: Acentuação Gráfica, Ortografia - 02/06/2026
- **Mentoria 03**: Substantivo, Adjetivo e Artigo - 16/06/2026
- **Mentoria 04**: Pronomes, Numeral, Advérbio - 30/06/2026
- **Mentoria 05**: Conjunções - 14/07/2026
- **Mentoria 06**: Verbo - 11/08/2026
- **Mentoria 07**: Sintaxe: Período Simples - 25/08/2026
- **Mentoria 08**: Período Composto e Pontuação - 22/09/2026
- **Mentoria 09**: Concordância - 06/10/2026
- **Mentoria 10**: Regência e Crase - 03/11/2026
- **Mentoria 11**: Compreensão e Interpretação - 17/11/2026
- **Mentoria 12**: Tipos e Gêneros - 01/12/2026
- **Mentoria 13**: Coesão e Coerência - 15/12/2026
- **Mentoria 14**: Denotação, Conotação - 12/01/2027
- **Mentoria 15**: Live Final - 26/01/2027

### **🏆 Simulados (10 eventos)**
- **Simulado 01**: Diagnóstico - 29/05/2026
- **Simulado 02**: Mentorias 2 e 3 - 28/06/2026
- **Simulado 03**: Mentorias 2 a 5 - 29/07/2026
- **Simulado 04**: Mentorias 2 a 6 - 29/08/2026
- **Simulado 05**: Mentorias 2 a 8 - 28/09/2026
- **Simulado 06**: Mentorias 2 a 9 - 29/10/2026
- **Simulado 07**: Mentorias 2 a 11 - 28/11/2026
- **Simulado 08**: Mentorias 2 a 13 - 29/12/2026
- **Simulado 09**: Mentorias 2 a 14 - 29/01/2027
- **Simulado 10**: TODO CONTEÚDO - 15/02/2027

### **📝 Resoluções (9 eventos)**
- **Resolução 01**: Simulado Diagnóstico - 31/05/2026
- **Resolução 02**: Simulado Mentorias 2 e 3 - 29/06/2026
- **Resolução 03**: Simulado Mentorias 2 a 5 - 31/07/2026
- **Resolução 04**: Simulado Mentorias 2 a 6 - 31/08/2026
- **Resolução 05**: Simulado Mentorias 2 a 8 - 30/09/2026
- **Resolução 06**: Simulado Mentorias 2 a 9 - 31/10/2026
- **Resolução 07**: Simulado Mentorias 2 a 11 - 30/11/2026
- **Resolução 08**: Simulado Mentorias 2 a 13 - 31/12/2026
- **Resolução 09**: Simulado Mentorias 2 a 14 - 31/01/2027

### **📄 Entregas de Redação (10 eventos)**
- **Entrega TEMA 01**: 15/06/2026 | **Recebimento**: 22/06/2026
- **Entrega TEMA 02**: 15/07/2026 | **Recebimento**: 22/07/2026
- **Entrega TEMA 03**: 15/08/2026 | **Recebimento**: 22/08/2026
- **Entrega TEMA 04**: 15/09/2026 | **Recebimento**: 22/09/2026
- **Entrega TEMA 05**: 15/10/2026 | **Recebimento**: 22/10/2026

## 🎨 **Funcionalidades da Interface**

### **Visualizador de Cronograma**
- ✅ **Abas organizadas** por tipo de evento
- ✅ **Busca em tempo real** por título ou descrição
- ✅ **Filtros por tipo** (Mentorias, Simulados, etc.)
- ✅ **Cards informativos** com todos os detalhes
- ✅ **Indicadores visuais** para eventos obrigatórios
- ✅ **Informações completas**: data, horário, duração, instrutor

### **Importador de Cronograma**
- ✅ **Botão de importação** para professores e admins
- ✅ **Feedback visual** durante a importação
- ✅ **Contagem de eventos** criados
- ✅ **Verificação de permissões** automática
- ✅ **Atualização automática** da lista após importação

## 🔧 **Estrutura Técnica**

### **Campos da Tabela**
- `title`: Título do evento
- `description`: Descrição detalhada
- `event_date`: Data do evento
- `event_time`: Horário do evento
- `event_type`: Tipo (mentoria, simulado, resolucao, entrega, recebimento)
- `duration_minutes`: Duração em minutos
- `instructor`: Nome do instrutor
- `location`: Local do evento
- `is_mandatory`: Se é obrigatório
- `max_participants`: Número máximo de participantes

### **Tipos de Evento**
- **mentoria**: Aulas de conteúdo
- **simulado**: Avaliações e testes
- **resolucao**: Resoluções comentadas
- **entrega**: Prazos de entrega
- **recebimento**: Recebimento de correções

## 🚀 **Como Usar**

### **Para Professores/Admins:**
1. Acesse a página de Calendário
2. Clique em "Importar Cronograma"
3. Aguarde a importação (44 eventos)
4. Visualize o cronograma organizado
5. Edite eventos conforme necessário

### **Para Estudantes:**
1. Acesse a página de Calendário
2. Visualize o cronograma completo
3. Use os filtros para encontrar eventos específicos
4. Acompanhe prazos e datas importantes

## 📱 **Responsividade**

- ✅ **Mobile**: Interface adaptada para celulares
- ✅ **Tablet**: Layout otimizado para tablets
- ✅ **Desktop**: Experiência completa em computadores
- ✅ **Touch**: Controles otimizados para toque

## 🎯 **Benefícios**

1. **Organização**: Cronograma completo em um local
2. **Acessibilidade**: Fácil navegação e busca
3. **Flexibilidade**: Filtros e organização por tipo
4. **Informação**: Detalhes completos de cada evento
5. **Integração**: Funciona com o sistema existente
6. **Escalabilidade**: Fácil adição de novos eventos

## ⚠️ **Observações Importantes**

- **Permissões**: Apenas professores e admins podem importar
- **Duplicação**: O sistema evita duplicar eventos existentes
- **Datas**: Todos os eventos estão com datas de 2026-2027
- **Horários**: Mentorias às 19h, Simulados às 14h
- **Duração**: Mentorias e Resoluções: 120min, Simulados: 240min

---

**Sistema implementado e pronto para uso!** 🎉
