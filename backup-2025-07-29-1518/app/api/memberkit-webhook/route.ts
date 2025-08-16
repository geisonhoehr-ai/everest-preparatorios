import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseServer" // Usar o cliente admin para operações seguras

// Função para verificar a assinatura do webhook (PLACEHOLDER)
// Você precisará consultar a documentação do Memberkit para a implementação exata.
// Geralmente envolve calcular um hash do payload com a chave secreta e comparar com o cabeçalho 'X-Memberkit-Signature'.
async function verifyMemberkitSignature(request: Request, payload: string): Promise<boolean> {
  const signature = request.headers.get("X-Memberkit-Signature") // Ou o nome do cabeçalho que o Memberkit usa
  const secret = process.env.MEMBERKIT_WEBHOOK_SECRET

  if (!signature || !secret) {
    console.error("Webhook: Assinatura ou segredo não fornecidos.")
    return false
  }

  // --- ESTE É UM PLACEHOLDER ---
  // A lógica real de verificação de assinatura do Memberkit deve vir aqui.
  // Exemplo (pode variar):
  // const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  // return signature === expectedSignature;
  // --- FIM DO PLACEHOLDER ---

  // Por enquanto, para testes, vamos retornar true.
  // EM PRODUÇÃO, ISSO DEVE SER UMA VERIFICAÇÃO REAL!
  return true
}

export async function POST(request: Request) {
  try {
    const payload = await request.text() // Ler o corpo como texto para verificação de assinatura
    const jsonPayload = JSON.parse(payload) // Depois parsear para JSON

    // 1. Verificar a assinatura do webhook (CRUCIAL PARA SEGURANÇA)
    const isVerified = await verifyMemberkitSignature(request, payload)
    if (!isVerified) {
      return new NextResponse("Assinatura do Webhook inválida", { status: 401 })
    }

    // 2. Processar o evento do Memberkit
    // A estrutura do payload do Memberkit pode variar.
    // Você precisará adaptar isso com base nos eventos reais que o Memberkit envia.
    const eventType = jsonPayload.event // Ex: 'subscription.created', 'subscription.updated', 'subscription.deleted'
    const userEmail = jsonPayload.data?.email // Ex: o email do usuário no payload
    const subscriptionStatus = jsonPayload.data?.status // Ex: 'active', 'canceled'

    if (!userEmail) {
      console.warn("Webhook: E-mail do usuário não encontrado no payload.", jsonPayload)
      return new NextResponse("E-mail do usuário não encontrado", { status: 400 })
    }

    console.log(`Webhook Memberkit recebido: Evento=${eventType}, Email=${userEmail}, Status=${subscriptionStatus}`)

    // Lógica para atualizar a tabela `paid_users` no Supabase
    switch (eventType) {
      case "subscription.created":
      case "subscription.updated":
        // Se a assinatura está ativa, adicione/atualize o usuário como pagante
        if (subscriptionStatus === "active") {
          const { error } = await supabaseAdmin.from("paid_users").upsert({ email: userEmail }, { onConflict: "email" })
          if (error) {
            console.error("Erro ao upsertar usuário pagante:", error)
            return new NextResponse("Erro interno do servidor", { status: 500 })
          }
          console.log(`Usuário ${userEmail} adicionado/atualizado como pagante.`)
        } else if (subscriptionStatus === "canceled" || subscriptionStatus === "expired") {
          // Se a assinatura foi cancelada/expirada, remova o usuário da lista de pagantes
          const { error } = await supabaseAdmin.from("paid_users").delete().eq("email", userEmail)
          if (error) {
            console.error("Erro ao remover usuário pagante:", error)
            return new NextResponse("Erro interno do servidor", { status: 500 })
          }
          console.log(`Usuário ${userEmail} removido da lista de pagantes.`)
        }
        break
      case "subscription.deleted":
        // Se a assinatura foi deletada, remova o usuário da lista de pagantes
        const { error } = await supabaseAdmin.from("paid_users").delete().eq("email", userEmail)
        if (error) {
          console.error("Erro ao remover usuário pagante:", error)
          return new NextResponse("Erro interno do servidor", { status: 500 })
        }
        console.log(`Usuário ${userEmail} removido da lista de pagantes (assinatura deletada).`)
        break
      // Adicione outros casos de evento conforme a documentação do Memberkit
      default:
        console.log(`Evento Memberkit não tratado: ${eventType}`)
        break
    }

    return new NextResponse("Webhook processado com sucesso", { status: 200 })
  } catch (error) {
    console.error("Erro ao processar webhook do Memberkit:", error)
    return new NextResponse("Erro interno do servidor", { status: 500 })
  }
}
