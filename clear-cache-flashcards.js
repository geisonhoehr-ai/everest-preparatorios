// Script para limpar cache dos flashcards
console.log('🧹 Limpando cache dos flashcards...')

// Limpar localStorage
localStorage.clear()
console.log('✅ localStorage limpo')

// Limpar sessionStorage
sessionStorage.clear()
console.log('✅ sessionStorage limpo')

// Recarregar página
console.log('🔄 Recarregando página...')
window.location.reload()
