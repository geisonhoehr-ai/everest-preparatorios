import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabaseServer'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    // Verificar se é professor
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_uuid', user.id)
      .single()

    if (!userRole || !['teacher', 'admin'].includes(userRole.role)) {
      return NextResponse.json({ error: 'Acesso negado. Apenas professores podem corrigir redações.' }, { status: 403 })
    }

    const body = await request.json()
    const {
      redacao_id,
      erros_pontuacao,
      erros_ortografia,
      erros_caligrafia,
      erros_vocabulario,
      erros_acentuacao,
      erros_morfosintaxe,
      tema_ok,
      tese_ok,
      desfecho_ok,
      coesao_tema_tese,
      coesao_tese_desfecho,
      dev1_arg1_ok,
      dev1_informatividade_ok,
      dev1_desfecho_ok,
      dev1_coesao_ok,
      dev2_arg2_ok,
      dev2_informatividade_ok,
      dev2_desfecho_ok,
      dev2_coesao_ok,
      conclusao_retomada_ok,
      conclusao_proposta_ok,
      conclusao_resultado_ok,
      conclusao_coesao_ok,
      tese_completa,
      modalizador_presente,
      tangenciamento,
      tese_neutra,
      arg1_coerente,
      arg1_justifica_tese,
      arg2_coerente,
      arg2_justifica_tese,
      informatividade_intro,
      informatividade_dev1,
      informatividade_dev2,
      feedback_geral,
      sugestoes_melhoria
    } = body

    // Inserir avaliação
    const { data: avaliacao, error: insertError } = await supabase
      .from('avaliacoes_redacao')
      .insert({
        redacao_id,
        professor_id: user.id,
        erros_pontuacao,
        erros_ortografia,
        erros_caligrafia,
        erros_vocabulario,
        erros_acentuacao,
        erros_morfosintaxe,
        tema_ok,
        tese_ok,
        desfecho_ok,
        coesao_tema_tese,
        coesao_tese_desfecho,
        dev1_arg1_ok,
        dev1_informatividade_ok,
        dev1_desfecho_ok,
        dev1_coesao_ok,
        dev2_arg2_ok,
        dev2_informatividade_ok,
        dev2_desfecho_ok,
        dev2_coesao_ok,
        conclusao_retomada_ok,
        conclusao_proposta_ok,
        conclusao_resultado_ok,
        conclusao_coesao_ok,
        tese_completa,
        modalizador_presente,
        tangenciamento,
        tese_neutra,
        arg1_coerente,
        arg1_justifica_tese,
        arg2_coerente,
        arg2_justifica_tese,
        informatividade_intro,
        informatividade_dev1,
        informatividade_dev2,
        feedback_geral,
        sugestoes_melhoria
      })
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao inserir avaliação:', insertError)
      return NextResponse.json({ error: 'Erro ao salvar avaliação' }, { status: 500 })
    }

    // Atualizar status da redação para 'corrigida'
    const { error: updateError } = await supabase
      .from('redacoes')
      .update({ 
        status: 'corrigida',
        data_correcao: new Date().toISOString()
      })
      .eq('id', redacao_id)

    if (updateError) {
      console.error('Erro ao atualizar status da redação:', updateError)
    }

    return NextResponse.json({ 
      success: true, 
      avaliacao,
      message: 'Avaliação salva com sucesso!' 
    })

  } catch (error) {
    console.error('Erro na API de avaliações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const redacaoId = searchParams.get('redacao_id')

    if (!redacaoId) {
      return NextResponse.json({ error: 'ID da redação é obrigatório' }, { status: 400 })
    }

    // Buscar avaliação existente
    const { data: avaliacao, error } = await supabase
      .from('avaliacoes_redacao')
      .select('*')
      .eq('redacao_id', redacaoId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Erro ao buscar avaliação:', error)
      return NextResponse.json({ error: 'Erro ao buscar avaliação' }, { status: 500 })
    }

    return NextResponse.json({ avaliacao })

  } catch (error) {
    console.error('Erro na API de avaliações:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
} 