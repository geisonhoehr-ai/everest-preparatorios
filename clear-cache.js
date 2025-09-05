// Script para limpar cache do navegador
console.log('🧹 Limpando cache do sistema...');

// Limpar localStorage
if (typeof window !== 'undefined') {
  localStorage.clear();
  sessionStorage.clear();
  
  // Limpar cache do service worker se existir
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => {
        registration.unregister();
      });
    });
  }
  
  console.log('✅ Cache limpo com sucesso!');
  console.log('🔄 Recarregue a página para aplicar as mudanças');
} else {
  console.log('⚠️ Execute este script no navegador');
}