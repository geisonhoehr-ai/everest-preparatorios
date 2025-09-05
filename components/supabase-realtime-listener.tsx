"use client"

import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function SupabaseRealtimeListener() {
  useEffect(() => {
    // Configurar listener para mudanças em tempo real
    const channel = supabase.channel('realtime-changes')
    
    // Escutar mudanças na tabela user_profiles
    channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_profiles'
      },
      (payload) => {
        console.log('🔄 Mudança detectada em user_profiles:', payload)
        // Aqui você pode adicionar lógica para atualizar o estado local
        // ou mostrar notificações para o usuário
      }
    )

    // Subscrever ao canal
    channel.subscribe()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return null
}
