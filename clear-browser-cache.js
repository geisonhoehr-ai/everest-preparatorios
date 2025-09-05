// Script para limpar cache do navegador
console.log('🧹 Limpando cache do navegador...')

// Função para limpar localStorage
function clearLocalStorage() {
  try {
    localStorage.clear()
    console.log('✅ localStorage limpo')
  } catch (error) {
    console.log('❌ Erro ao limpar localStorage:', error)
  }
}

// Função para limpar sessionStorage
function clearSessionStorage() {
  try {
    sessionStorage.clear()
    console.log('✅ sessionStorage limpo')
  } catch (error) {
    console.log('❌ Erro ao limpar sessionStorage:', error)
  }
}

// Função para recarregar a página
function reloadPage() {
  try {
    window.location.reload(true) // Força reload sem cache
    console.log('🔄 Página recarregada')
  } catch (error) {
    console.log('❌ Erro ao recarregar página:', error)
  }
}

// Executar limpeza
console.log('🧹 Iniciando limpeza de cache...')
clearLocalStorage()
clearSessionStorage()

// Aguardar um pouco e recarregar
setTimeout(() => {
  console.log('🔄 Recarregando página em 1 segundo...')
  reloadPage()
}, 1000)

console.log('✅ Cache do navegador limpo!')
console.log('🔄 A página será recarregada automaticamente')
