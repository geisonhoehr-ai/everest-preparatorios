import { createClient } from "@/lib/supabase/client";

export async function getUserRoleClient(userId: string) {
  try {
    const supabase = createClient();
    
    console.log('Buscando role para userId:', userId);
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', userId)
      .single();

    if (error) {
      // Log mais detalhado do erro
      console.log('Erro ao buscar role:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      
      // Se não encontrar role, retorna 'student' como padrão
      if (error.code === 'PGRST116') {
        console.log('Nenhum role encontrado, retornando student como padrão');
        return 'student';
      }
      
      // Para outros erros, também retorna 'student' como padrão
      console.log('Erro inesperado ao buscar role, retornando student como padrão');
      return 'student';
    }

    console.log('Role encontrado:', data?.role);
    return data?.role || 'student';
  } catch (err) {
    console.log('Erro na função getUserRoleClient:', err instanceof Error ? err.message : String(err));
    return 'student';
  }
}
