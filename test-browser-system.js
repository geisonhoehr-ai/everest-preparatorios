// Teste do sistema de progresso via navegador
// Execute este script no console do navegador (F12)

console.log("🧪 Testando sistema de progresso no navegador...");

// 1. Verificar se as funções estão disponíveis
console.log("1️⃣ Verificando funções disponíveis...");
console.log("updateFlashcardProgress:", typeof updateFlashcardProgress);
console.log("updateQuizProgress:", typeof updateQuizProgress);
console.log("getUserProgress:", typeof getUserProgress);
console.log("getGlobalRanking:", typeof getGlobalRanking);

// 2. Testar inicialização de progresso
console.log("2️⃣ Testando inicialização de progresso...");
if (typeof initializeUserProgress === 'function') {
  // Simular ID de usuário
  const testUserId = "00000000-0000-0000-0000-000000000000";
  
  initializeUserProgress(testUserId)
    .then(result => {
      console.log("✅ Inicialização:", result);
    })
    .catch(error => {
      console.error("❌ Erro na inicialização:", error);
    });
} else {
  console.log("⚠️ Função initializeUserProgress não encontrada");
}

// 3. Testar progresso de flashcard
console.log("3️⃣ Testando progresso de flashcard...");
if (typeof updateFlashcardProgress === 'function') {
  const testUserId = "00000000-0000-0000-0000-000000000000";
  
  updateFlashcardProgress(testUserId, "test-topic", true, 30)
    .then(result => {
      console.log("✅ Progresso flashcard:", result);
    })
    .catch(error => {
      console.error("❌ Erro no progresso flashcard:", error);
    });
} else {
  console.log("⚠️ Função updateFlashcardProgress não encontrada");
}

// 4. Testar progresso de quiz
console.log("4️⃣ Testando progresso de quiz...");
if (typeof updateQuizProgress === 'function') {
  const testUserId = "00000000-0000-0000-0000-000000000000";
  
  updateQuizProgress(testUserId, "test-quiz", 8, 10, 120)
    .then(result => {
      console.log("✅ Progresso quiz:", result);
    })
    .catch(error => {
      console.error("❌ Erro no progresso quiz:", error);
    });
} else {
  console.log("⚠️ Função updateQuizProgress não encontrada");
}

// 5. Testar ranking
console.log("5️⃣ Testando ranking...");
if (typeof getGlobalRanking === 'function') {
  getGlobalRanking()
    .then(result => {
      console.log("✅ Ranking global:", result);
    })
    .catch(error => {
      console.error("❌ Erro no ranking:", error);
    });
} else {
  console.log("⚠️ Função getGlobalRanking não encontrada");
}

console.log("🎯 Teste concluído! Verifique os resultados acima.");
