import { createClient } from "@/lib/supabase/client"

export async function enviarMensagemSuporte({ nome, email, mensagem }: { nome: string; email: string; mensagem: string }) {
  const supabase = createClient();
  const { error } = await supabase.from("suporte_mensagens").insert({ nome, email, mensagem });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
} 