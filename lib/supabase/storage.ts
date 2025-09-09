/**
 * Utilitários para Supabase Storage
 */

/**
 * Corrige a URL do Supabase Storage se estiver incorreta
 * @param url URL original do Supabase Storage
 * @param projectId ID do projeto Supabase
 * @returns URL corrigida
 */
export function fixSupabaseStorageUrl(url: string, projectId: string): string {
  // Verificar se a URL contém o domínio incorreto
  if (url.includes('storage.supabase.co')) {
    return url.replace('storage.supabase.co', `${projectId}.supabase.co`)
  }
  
  // Se já estiver correto, retornar como está
  return url
}

/**
 * Gera URL pública correta para arquivos no Supabase Storage
 * @param projectId ID do projeto Supabase
 * @param bucket Nome do bucket
 * @param filePath Caminho do arquivo
 * @returns URL pública correta
 */
export function getCorrectPublicUrl(projectId: string, bucket: string, filePath: string): string {
  return `https://${projectId}.supabase.co/storage/v1/object/public/${bucket}/${filePath}`
}

/**
 * Valida se uma URL do Supabase Storage está correta
 * @param url URL para validar
 * @param projectId ID do projeto Supabase
 * @returns true se a URL está correta
 */
export function isValidSupabaseStorageUrl(url: string, projectId: string): boolean {
  return url.includes(`${projectId}.supabase.co`) && url.includes('/storage/v1/object/public/')
}
