export const ranks = [
  { name: "Conscrito", minScore: 0 },
  { name: "Recruta", minScore: 100 },
  { name: "S2", minScore: 300 },
  { name: "S1", minScore: 600 },
  { name: "Cabo", minScore: 1000 },
  { name: "Sargento", minScore: 2000 },
  { name: "Tenente", minScore: 4000 },
  { name: "Capitão", minScore: 7000 },
  { name: "Major", minScore: 10000 },
  { name: "Coronel", minScore: 15000 },
  { name: "General", minScore: 25000 },
]

export function getRank(score: number) {
  for (let i = ranks.length - 1; i >= 0; i--) {
    if (score >= ranks[i].minScore) {
      return ranks[i].name
    }
  }
  return "Conscrito" // Default if score is below all thresholds
}

export function getNextRankInfo(score: number) {
  for (let i = 0; i < ranks.length; i++) {
    if (score < ranks[i].minScore) {
      return {
        name: ranks[i].name,
        scoreNeeded: ranks[i].minScore - score,
      }
    }
  }
  return null // Already at the highest rank
}
