# 🎮 **SISTEMA RPG ÉPICO DO CONHECIMENTO**

## **📋 RESUMO EXECUTIVO**

Sistema de gamificação completo implementado no Everest Preparatórios, transformando o estudo em uma jornada épica de RPG com:

- **5 Categorias de Ranking** (Geral, Flashcards, Quiz, Redação, Provas)
- **25 Níveis Épicos** no ranking geral
- **Sistema de XP** específico por atividade
- **Conquistas Compartilháveis** nas redes sociais
- **Modal de Parabéns** animado e motivacional
- **Streaks de Estudo** com bônus
- **Sistema "Mágico"** onde o aluno não vê os números exatos

---

## **🏗️ ESTRUTURA DO BANCO DE DADOS**

### **Tabelas Principais:**

#### **1. student_profiles (Atualizada)**
```sql
-- Campos RPG adicionados:
flashcard_xp INTEGER DEFAULT 0
quiz_xp INTEGER DEFAULT 0
redacao_xp INTEGER DEFAULT 0
prova_xp INTEGER DEFAULT 0
flashcard_level INTEGER DEFAULT 1
quiz_level INTEGER DEFAULT 1
redacao_level INTEGER DEFAULT 1
prova_level INTEGER DEFAULT 1
flashcard_rank TEXT DEFAULT 'Novato da Guilda'
quiz_rank TEXT DEFAULT 'Novato da Guilda'
redacao_rank TEXT DEFAULT 'Novato da Guilda'
prova_rank TEXT DEFAULT 'Novato da Guilda'
general_rank TEXT DEFAULT 'Novato da Guilda'
last_level_up TIMESTAMP WITH TIME ZONE
total_achievements INTEGER DEFAULT 0
current_streak_days INTEGER DEFAULT 0
longest_streak_days INTEGER DEFAULT 0
```

#### **2. rpg_ranks (Nova)**
```sql
id SERIAL PRIMARY KEY
category TEXT NOT NULL -- 'general', 'flashcard', 'quiz', 'redacao', 'prova'
level INTEGER NOT NULL
title TEXT NOT NULL
insignia TEXT NOT NULL
blessing TEXT NOT NULL
xp_required INTEGER NOT NULL
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

#### **3. achievements (Nova)**
```sql
id SERIAL PRIMARY KEY
user_uuid TEXT NOT NULL
achievement_type TEXT NOT NULL
title TEXT NOT NULL
description TEXT NOT NULL
icon TEXT NOT NULL
xp_reward INTEGER NOT NULL
unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
shared BOOLEAN DEFAULT FALSE
```

#### **4. study_streaks (Nova)**
```sql
id SERIAL PRIMARY KEY
user_uuid TEXT NOT NULL
start_date DATE NOT NULL
end_date DATE
days_count INTEGER NOT NULL
is_active BOOLEAN DEFAULT TRUE
created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
```

---

## **🎯 SISTEMA DE XP POR ATIVIDADE**

### **Flashcards (Mago da Memória)**
- **XP Base:** 5 por card
- **Bônus Streak:** +2 por dia consecutivo
- **Máximo Diário:** 50 XP
- **Ranks:** 5 níveis (Aprendiz → Lenda da Memória)

### **Quizzes (Guerreiro do Conhecimento)**
- **XP Base:** 15 por quiz
- **Bônus Perfeição:** +10 por 100%
- **Máximo por Quiz:** 100 XP
- **Ranks:** 5 níveis (Recruta → Lenda da Batalha)

### **Redações (Bardo da Escrita)**
- **XP Base:** 50 por redação
- **Bônus Alta Nota:** +25 por nota 9+
- **Máximo por Redação:** 200 XP
- **Ranks:** 5 níveis (Contador → Lenda da Escrita)

### **Provas (Paladino da Sabedoria)**
- **XP Base:** 100 por prova
- **Bônus Aprovação:** +50 por aprovação
- **Máximo por Prova:** 500 XP
- **Ranks:** 5 níveis (Acolito → Lenda da Sabedoria)

---

## **🏆 RANKING GERAL ÉPICO (25 NÍVEIS)**

### **Liga 1: Aprendizes (1-5)**
1. **Novato da Guilda** 🧿 - "Todo herói começou do zero"
2. **Estudante Arcano** 📜 - "Conhecimento é o primeiro feitiço"
3. **Explorador das Ruínas** 🧭 - "Os mapas se revelam para quem ousa"
4. **Portador da Chama** 🔥 - "Uma pequena chama pode incendiar o mundo"
5. **Aprendiz de Batalha** 🛡️ - "Cada erro te fortalece"

### **Liga 2: Guerreiros (6-10)**
6. **Guerreiro Errante** ⚔️ - "A estrada é longa, mas você já empunha sua arma"
7. **Mago Iniciado** 🔮 - "O poder está na mente disciplinada"
8. **Ranger da Fronteira** 🦅 - "Você enxerga longe"
9. **Alquimista do Saber** 🧪 - "Misturar ideias também é magia"
10. **Guardião do Portão** 🏰 - "Agora você guarda conhecimento valioso"

### **Liga 3: Heróis (11-15)**
11. **Paladino da Lógica** ⚖️ - "Você defende ideias com verdade"
12. **Feiticeiro Elemental** 🌩️ - "Você manipula o saber como forças da natureza"
13. **Assassino de Dúvidas** 🗡️ - "Nenhuma dúvida resiste à sua disciplina"
14. **Bardo dos Códigos** 🎻 - "Seu conhecimento já inspira outros"
15. **Domador de Pergaminhos** 📚 - "Os livros já te obedecem"

### **Liga 4: Mestres (16-20)**
16. **Arcanista Supremo** 💠 - "Você toca as estrelas com o que sabe"
17. **General da Mente** 🎖️ - "Você lidera batalhas com estratégia"
18. **Mestre Ilusionista** 🪞 - "Você transforma o complexo em simples"
19. **Xamã do Conhecimento Ancestral** 🐺 - "Você carrega a sabedoria de eras"
20. **Arquimago do Saber** 🧙‍♂️ - "Você não apenas aprende: você revela"

### **Liga 5: Lendas (21-25)**
21. **Lâmina do Infinito** 🗡️ - "Seu esforço cortou os limites da dúvida"
22. **Profeta das Runas** 🔤 - "Você lê além das palavras"
23. **Guardião do Portal do Tempo** ⏳ - "Você respeita o tempo, e o tempo te honra"
24. **Avatar do Conhecimento** 🌠 - "Você é a encarnação do que estudou"
25. **Lenda da Torre Eterna** 🏯 - "Seu nome está cravado no topo"

---

## **🎉 SISTEMA DE CONQUISTAS**

### **Conquistas Automáticas:**
- **Primeiro Passo** 🎉 - Primeiro nível (100 XP)
- **Semana de Dedicação** 🔥 - 7 dias seguidos (200 XP)
- **Mestre da Persistência** ⚡ - 30 dias seguidos (500 XP)
- **Perfeição Absoluta** 💯 - Quiz 100% (150 XP)
- **Obra-Prima** ✍️ - Redação nota 10 (300 XP)
- **Aprovado com Honra** 📝 - Prova aprovada (400 XP)

### **Conquistas de Evolução:**
- **Evolução Flashcard** 📚 - Subida de nível em flashcards
- **Evolução Quiz** 🧠 - Subida de nível em quizzes
- **Evolução Redação** ✍️ - Subida de nível em redações
- **Evolução Prova** 📝 - Subida de nível em provas

---

## **📱 SISTEMA DE COMPARTILHAMENTO**

### **Modal de Parabéns:**
- **Animação de Confete** 🎉🎊
- **Insígnia Animada** (bounce)
- **Título Épico** com gradiente dourado
- **Bênção Motivacional**
- **Botão de Compartilhamento**

### **Redes Sociais Suportadas:**
- **WhatsApp** - Link direto com texto
- **Facebook** - Compartilhamento de URL
- **Twitter** - Tweet com hashtags
- **LinkedIn** - Post profissional

### **Texto de Compartilhamento:**
```
🎉 Acabei de evoluir para [Título] no Everest Preparatórios!
[Bênção] #EverestPreparatorios #Conhecimento #Evolução
```

---

## **🔮 SISTEMA "MÁGICO"**

### **O que o aluno NÃO vê:**
- Números exatos de XP
- Fórmulas de progressão
- Curvas de dificuldade
- Mecânicas internas

### **O que o aluno VÊ:**
- Nível atual e próximo
- Rank atual com insignia
- Bênção motivacional
- Progresso visual
- Conquistas desbloqueadas

### **Benefícios:**
- **Mistério** - Mantém o interesse
- **Surpresa** - Evoluções inesperadas
- **Motivação** - Foco no resultado
- **Engajamento** - Sistema "mágico"

---

## **⚡ SISTEMA DE STREAKS**

### **Mecânica:**
- **Contador Diário** - Dias consecutivos estudando
- **Bônus XP** - +2 XP por dia no streak
- **Conquistas** - 7 e 30 dias
- **Recorde** - Maior streak da história

### **Benefícios:**
- **Consistência** - Incentiva estudo diário
- **Motivação** - Não quebrar o streak
- **Progressão** - Bônus acumulativos
- **Gamificação** - Elemento de jogo

---

## **🎮 INTEGRAÇÃO COM ATIVIDADES**

### **Flashcards:**
```typescript
// Ao completar um flashcard
await addActivityXP(userId, 'flashcard', 5)
await updateStudyStreak(userId)
```

### **Quizzes:**
```typescript
// Ao finalizar quiz
const baseXP = 15
const perfectBonus = score === 100 ? 10 : 0
await addActivityXP(userId, 'quiz', baseXP + perfectBonus)
```

### **Redações:**
```typescript
// Ao receber nota
const baseXP = 50
const highScoreBonus = nota >= 9 ? 25 : 0
await addActivityXP(userId, 'redacao', baseXP + highScoreBonus)
```

### **Provas:**
```typescript
// Ao ser aprovado
const baseXP = 100
const approvalBonus = aprovado ? 50 : 0
await addActivityXP(userId, 'prova', baseXP + approvalBonus)
```

---

## **📊 DASHBOARD RPG**

### **Abas de Ranking:**
1. **Geral** - Ranking total de XP
2. **Flashcards** - Ranking específico de flashcards
3. **Quizzes** - Ranking específico de quizzes
4. **Redações** - Ranking específico de redações
5. **Provas** - Ranking específico de provas

### **Informações Exibidas:**
- **Rank Atual** com insignia
- **Nível** e progresso
- **XP** da categoria
- **Posição** no ranking
- **Próximo Rank** e XP necessário

---

## **🚀 BENEFÍCIOS DO SISTEMA**

### **Para o Aluno:**
- **Motivação Constante** - Sistema de progressão
- **Reconhecimento** - Ranks e conquistas
- **Comunidade** - Compartilhamento social
- **Gamificação** - Estudo como jogo
- **Mistério** - Sistema "mágico"

### **Para a Plataforma:**
- **Engajamento** - Maior tempo de uso
- **Retenção** - Alunos voltam para evoluir
- **Marketing Viral** - Compartilhamento orgânico
- **Diferenciação** - Sistema único
- **Dados** - Métricas de progresso

### **Para o Professor:**
- **Motivação** - Alunos mais engajados
- **Feedback** - Progresso visível
- **Gamificação** - Ferramenta educacional
- **Comunidade** - Alunos conectados

---

## **🎯 PRÓXIMOS PASSOS**

### **Implementação Imediata:**
1. ✅ **Banco de Dados** - Estrutura criada
2. ✅ **Sistema RPG** - Funções implementadas
3. ✅ **Modal de Parabéns** - Componente criado
4. ✅ **Integração Quiz** - XP funcionando
5. 🔄 **Dashboard RPG** - Em implementação
6. ⏳ **Integração Flashcards** - Pendente
7. ⏳ **Integração Redações** - Pendente
8. ⏳ **Integração Provas** - Pendente

### **Melhorias Futuras:**
- **Eventos Especiais** - XP bônus em datas
- **Missões Diárias** - Objetivos específicos
- **Clãs** - Grupos de estudo
- **Líderes** - Rankings por turma
- **Recompensas** - Badges especiais

---

## **🎮 CONCLUSÃO**

O Sistema RPG Épico do Conhecimento transforma o Everest Preparatórios em uma plataforma de gamificação educacional única, onde:

- **Estudar é uma aventura** 🗺️
- **Cada atividade é uma batalha** ⚔️
- **Cada conquista é uma evolução** 🏆
- **Cada rank é uma honra** 👑
- **Cada compartilhamento é viral** 📱

**O conhecimento nunca foi tão épico!** 🚀✨ 