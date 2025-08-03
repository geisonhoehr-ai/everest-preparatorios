// Dados de exemplo para flashcards e quizzes interativos

export const sampleFlashcardsPortugues = [
  {
    id: 1,
    question: "Qual é a regra de acentuação para palavras paroxítonas terminadas em 'a'?",
    answer: "Palavras paroxítonas terminadas em 'a' são acentuadas quando a sílaba tônica é a penúltima e a palavra termina em 'a' + consoante (exceto 'n' e 'r')."
  },
  {
    id: 2,
    question: "O que é crase e quando deve ser usada?",
    answer: "Crase é a fusão da preposição 'a' com o artigo 'a'. Deve ser usada antes de substantivos femininos, locuções adverbiais femininas e antes de verbos no infinitivo."
  },
  {
    id: 3,
    question: "Explique a diferença entre 'há' e 'a'.",
    answer: "'Há' é verbo haver (tempo decorrido) e 'a' é preposição ou artigo. Ex: 'Há dois dias' (tempo) vs 'Vou a escola' (preposição)."
  },
  {
    id: 4,
    question: "Qual é a regra para o uso de 'por que', 'porque', 'por quê' e 'porquê'?",
    answer: "'Por que' (pergunta), 'porque' (resposta), 'por quê' (pergunta no final), 'porquê' (substantivo = motivo)."
  },
  {
    id: 5,
    question: "O que é colocação pronominal e quais são as regras básicas?",
    answer: "Colocação pronominal é a posição dos pronomes oblíquos. Regras: próclise (antes do verbo), ênclise (depois do verbo) e mesóclise (no meio do verbo)."
  }
]

export const sampleFlashcardsRegulamentos = [
  {
    id: 1,
    question: "Qual é o objetivo principal do Estatuto dos Militares?",
    answer: "O Estatuto dos Militares tem como objetivo estabelecer as normas gerais para a organização, funcionamento e administração das Forças Armadas."
  },
  {
    id: 2,
    question: "O que estabelece o ICA 111-1 sobre a hierarquia militar?",
    answer: "O ICA 111-1 estabelece que a hierarquia militar é a ordenação da autoridade, em níveis diferentes, dentro da estrutura das Forças Armadas."
  },
  {
    id: 3,
    question: "Qual é a função do ICA 111-2 no contexto militar?",
    answer: "O ICA 111-2 define as responsabilidades e deveres dos militares, estabelecendo normas de conduta e disciplina."
  },
  {
    id: 4,
    question: "O que determina a Lei 13.954/2019 sobre o serviço militar?",
    answer: "A Lei 13.954/2019 estabelece normas sobre o serviço militar, incluindo requisitos, duração e condições para prestação do serviço."
  },
  {
    id: 5,
    question: "Qual é o papel do RDAER na estrutura da FAB?",
    answer: "O RDAER (Regulamento de Disciplina da Aeronáutica) estabelece as normas disciplinares específicas para os membros da Força Aérea Brasileira."
  }
]

export const sampleQuizPortugues = [
  {
    id: 1,
    question: "Qual das opções está correta quanto à acentuação?",
    options: [
      "A palavra 'também' é acentuada porque é paroxítona terminada em 'em'",
      "A palavra 'também' é acentuada porque é oxítona terminada em 'em'",
      "A palavra 'também' é acentuada porque é proparoxítona",
      "A palavra 'também' não deveria ser acentuada"
    ],
    correctAnswer: "A palavra 'também' é acentuada porque é paroxítona terminada em 'em'",
    explanation: "Palavras paroxítonas terminadas em 'em' são acentuadas conforme a regra de acentuação gráfica."
  },
  {
    id: 2,
    question: "Em qual das frases o uso da crase está correto?",
    options: [
      "Vou à escola todos os dias",
      "Vou a escola todos os dias",
      "Vou à escola e à trabalho",
      "Vou a escola e a trabalho"
    ],
    correctAnswer: "Vou à escola todos os dias",
    explanation: "Antes de substantivos femininos usa-se crase (à). 'Trabalho' é masculino, então não leva crase."
  },
  {
    id: 3,
    question: "Qual é a diferença entre 'há' e 'a' na frase: 'Há dois dias que não vou à escola'?",
    options: [
      "'Há' indica tempo decorrido, 'a' é preposição",
      "'Há' é preposição, 'a' indica tempo",
      "Ambos indicam tempo decorrido",
      "Ambos são preposições"
    ],
    correctAnswer: "'Há' indica tempo decorrido, 'a' é preposição",
    explanation: "'Há' é verbo haver (tempo decorrido), 'a' é preposição que forma a crase com o artigo 'a'."
  },
  {
    id: 4,
    question: "Qual das opções completa corretamente a frase: '___ você não veio ontem?'",
    options: [
      "Por que",
      "Porque",
      "Por quê",
      "Porquê"
    ],
    correctAnswer: "Por que",
    explanation: "'Por que' é usado em perguntas diretas ou indiretas."
  },
  {
    id: 5,
    question: "Em qual das frases a colocação pronominal está correta?",
    options: [
      "Não me diga isso",
      "Diga-me isso não",
      "Me diga isso não",
      "Diga isso não me"
    ],
    correctAnswer: "Não me diga isso",
    explanation: "A próclise é obrigatória quando há palavra atrativa como 'não' antes do verbo."
  }
]

export const sampleQuizRegulamentos = [
  {
    id: 1,
    question: "Qual é o objetivo principal do Estatuto dos Militares?",
    options: [
      "Estabelecer normas gerais para organização das Forças Armadas",
      "Definir apenas a hierarquia militar",
      "Estabelecer apenas normas disciplinares",
      "Definir apenas o serviço militar obrigatório"
    ],
    correctAnswer: "Estabelecer normas gerais para organização das Forças Armadas",
    explanation: "O Estatuto dos Militares é a lei fundamental que estabelece as normas gerais para organização, funcionamento e administração das Forças Armadas."
  },
  {
    id: 2,
    question: "O que estabelece o ICA 111-1 sobre a hierarquia militar?",
    options: [
      "A ordenação da autoridade em níveis diferentes",
      "Apenas os postos e graduações",
      "Apenas as responsabilidades dos oficiais",
      "Apenas as normas de conduta"
    ],
    correctAnswer: "A ordenação da autoridade em níveis diferentes",
    explanation: "O ICA 111-1 estabelece que a hierarquia militar é a ordenação da autoridade, em níveis diferentes, dentro da estrutura das Forças Armadas."
  },
  {
    id: 3,
    question: "Qual é a função do ICA 111-2 no contexto militar?",
    options: [
      "Definir responsabilidades e deveres dos militares",
      "Estabelecer apenas a hierarquia",
      "Definir apenas os postos",
      "Estabelecer apenas normas de disciplina"
    ],
    correctAnswer: "Definir responsabilidades e deveres dos militares",
    explanation: "O ICA 111-2 define as responsabilidades e deveres dos militares, estabelecendo normas de conduta e disciplina."
  },
  {
    id: 4,
    question: "O que determina a Lei 13.954/2019 sobre o serviço militar?",
    options: [
      "Normas sobre serviço militar, requisitos e duração",
      "Apenas a duração do serviço militar",
      "Apenas os requisitos para alistamento",
      "Apenas as condições de dispensa"
    ],
    correctAnswer: "Normas sobre serviço militar, requisitos e duração",
    explanation: "A Lei 13.954/2019 estabelece normas sobre o serviço militar, incluindo requisitos, duração e condições para prestação do serviço."
  },
  {
    id: 5,
    question: "Qual é o papel do RDAER na estrutura da FAB?",
    options: [
      "Estabelecer normas disciplinares específicas da FAB",
      "Definir apenas a hierarquia da FAB",
      "Estabelecer apenas os postos da FAB",
      "Definir apenas as responsabilidades dos oficiais"
    ],
    correctAnswer: "Estabelecer normas disciplinares específicas da FAB",
    explanation: "O RDAER (Regulamento de Disciplina da Aeronáutica) estabelece as normas disciplinares específicas para os membros da Força Aérea Brasileira."
  }
] 