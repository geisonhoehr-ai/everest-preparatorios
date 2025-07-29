export interface Sm2CardProgress {
  easeFactor: number // E-Factor
  repetitions: number // n
  intervalDays: number // I
  nextReviewDate: string // Data da próxima revisão (YYYY-MM-DD)
}

/**
 * Implementa o algoritmo SM-2 para calcular o próximo intervalo de revisão de um flashcard.
 * @param quality Qualidade da resposta (0-5):
 *   5: Resposta perfeita (sem hesitação)
 *   4: Resposta correta (com pequena hesitação)
 *   3: Resposta correta (com dificuldade, mas lembrada)
 *   2: Resposta incorreta (mas fácil de lembrar a resposta correta)
 *   1: Resposta incorreta (difícil de lembrar a resposta correta)
 *   0: Falha total (não lembrou nada)
 * @param currentProgress O progresso atual do cartão (easeFactor, repetitions, intervalDays).
 * @returns O novo progresso do cartão (easeFactor, repetitions, intervalDays, nextReviewDate).
 */
export function calculateSm2Progress(
  quality: number,
  currentProgress: Sm2CardProgress = { easeFactor: 2.5, repetitions: 0, intervalDays: 0, nextReviewDate: "" },
): Sm2CardProgress {
  let { easeFactor, repetitions, intervalDays } = currentProgress

  if (quality >= 3) {
    // Resposta correta (qualidade 3, 4 ou 5)
    if (repetitions === 0) {
      intervalDays = 1
    } else if (repetitions === 1) {
      intervalDays = 6
    } else {
      intervalDays = Math.round(intervalDays * easeFactor)
    }
    repetitions += 1
    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  } else {
    // Resposta incorreta (qualidade 0, 1 ou 2)
    repetitions = 0
    intervalDays = 1 // Reinicia o intervalo para 1 dia
    // easeFactor não muda para respostas incorretas no SM-2 original,
    // mas alguns implementam uma pequena penalidade. Vamos manter o original.
  }

  // Garante que o easeFactor não seja menor que 1.3
  easeFactor = Math.max(1.3, easeFactor)

  // Calcula a próxima data de revisão
  const today = new Date()
  const nextReviewDate = new Date(today.setDate(today.getDate() + intervalDays))

  return {
    easeFactor: Number.parseFloat(easeFactor.toFixed(2)), // Arredonda para 2 casas decimais
    repetitions: repetitions,
    intervalDays: intervalDays,
    nextReviewDate: nextReviewDate.toISOString().split("T")[0], // Formato YYYY-MM-DD
  }
}
