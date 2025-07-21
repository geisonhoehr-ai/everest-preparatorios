import { createClient } from "@/lib/supabaseClient"

/**
 * Obtém a role (teacher|student|etc.) de um usuário pelo ID.
 * É executado no cliente, portanto usa o Supabase JS browser-side.
 */
export async function getUserRoleClient(userId: string): Promise<string | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("user_roles").select("role").eq("user_uuid", userId).single()

  if (error) {
    console.error("[getUserRoleClient] erro ao buscar role:", error)
    return null
  }

  return data?.role ?? null
}
