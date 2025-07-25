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
      console.error('Erro ao buscar role:', error);
      // Se não encontrar role, retorna 'student' como padrão
      if (error.code === 'PGRST116') {
        console.log('Nenhum role encontrado, retornando student como padrão');
        return 'student';
      }
      return null;
    }

    console.log('Role encontrado:', data?.role);
    return data?.role || 'student';
  } catch (err) {
    console.error('Erro na função getUserRoleClient:', err);
    return 'student';
  }
}
