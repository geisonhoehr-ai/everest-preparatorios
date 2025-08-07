"use server"

import { createServerClient, type CookieOptions } from "@supabase/ssr"
import { cookies } from "next/headers"

// Função de debug para testar o sistema de roles
export async function debugUserSystem(email: string) {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore,
    },
  )

  try {
    console.log("🔍 DEBUG - Testando sistema para email:", email)

    // 1. Verificar se usuário existe no auth
    const { data: authUsers, error: authError } = await supabase
      .from("auth.users")
      .select("id, email")
      .eq("email", email)

    console.log("🔍 Auth users:", { authUsers, authError })

    // 2. Verificar paid_users
    const { data: paidUser, error: paidError } = await supabase
      .from("paid_users")
      .select("*")
      .eq("email", email)
      .single()

    console.log("🔍 Paid user:", { paidUser, paidError })

    // 3. Verificar user_roles
    const { data: userRoles, error: rolesError } = await supabase.from("user_roles").select("*")

    console.log("🔍 All user roles:", { userRoles, rolesError })

    // 4. Verificar tabelas de perfil
    const { data: studentProfiles, error: studentError } = await supabase.from("student_profiles").select("*")

    console.log("🔍 Student profiles:", { studentProfiles, studentError })

    const { data: teacherProfiles, error: teacherError } = await supabase.from("teacher_profiles").select("*")

    console.log("🔍 Teacher profiles:", { teacherProfiles, teacherError })

    return {
      success: true,
      data: {
        authUsers,
        paidUser,
        userRoles,
        studentProfiles,
        teacherProfiles,
      },
      errors: {
        authError,
        paidError,
        rolesError,
        studentError,
        teacherError,
      },
    }
  } catch (error) {
    console.error("❌ DEBUG - Erro geral:", error)
    return { success: false, error: String(error) }
  }
}

// Função simplificada para criar perfil
export async function createSimpleProfile(email: string, role: "student" | "teacher") {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore,
    },
  )

  try {
    // Buscar usuário
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) {
      return { success: false, error: "Usuário não autenticado" }
    }

    const userId = user.user.id

    console.log("🔧 Criando perfil simples:", { userId, email, role })

    // 1. Criar role
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .upsert(
        {
          user_uuid: userId,
          role,
          first_login: false,
          profile_completed: true,
        },
        { onConflict: "user_uuid" },
      )
      .select()

    console.log("🔧 Role criado:", { roleData, roleError })

    // 2. Criar perfil específico
    if (role === "teacher") {
      const { data: profileData, error: profileError } = await supabase
        .from("teacher_profiles")
        .upsert(
          {
            user_uuid: userId,
            nome_completo: "Professor Teste",
            especialidade: "Língua Portuguesa",
          },
          { onConflict: "user_uuid" },
        )
        .select()

      console.log("🔧 Teacher profile:", { profileData, profileError })
    } else {
      const { data: profileData, error: profileError } = await supabase
        .from("student_profiles")
        .upsert(
          {
            user_uuid: userId,
            nome_completo: "Aluno Teste",
            escola: "Escola Teste",
          },
          { onConflict: "user_uuid" },
        )
        .select()

      console.log("🔧 Student profile:", { profileData, profileError })
    }

    return { success: true }
  } catch (error) {
    console.error("❌ Erro ao criar perfil simples:", error)
    return { success: false, error: String(error) }
  }
}
