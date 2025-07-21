"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BookOpenText, GraduationCap, ChevronRight, User, School } from "lucide-react"
import { setUserRole, createUserProfile } from "@/app/actions"

export default function RoleSelectionPage() {
  const [step, setStep] = useState(1) // 1: role selection, 2: profile setup
  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | null>(null)
  const [loading, setLoading] = useState(false)
  const [profileData, setProfileData] = useState({
    nome_completo: "",
    // Student fields
    ano_escolar: "",
    objetivo: "",
    escola: "",
    // Teacher fields
    especialidade: "",
    bio: "",
    experiencia_anos: "",
    formacao: "",
  })
  const router = useRouter()

  const handleRoleSelection = (role: "student" | "teacher") => {
    setSelectedRole(role)
    setStep(2)
  }

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedRole) return

    setLoading(true)
    try {
      // Definir role do usuário
      await setUserRole(selectedRole)

      // Criar perfil específico
      await createUserProfile(selectedRole, profileData)

      // Redirecionar para dashboard
      router.push("/")
    } catch (error) {
      console.error("Erro ao criar perfil:", error)
      alert("Erro ao criar perfil. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const updateProfileData = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {step === 1 && (
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Bem-vindo ao Everest Preparatórios!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Para começar, nos conte qual é o seu perfil na plataforma
            </p>

            <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
              {/* Card Aluno */}
              <Card
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br from-primary/10 to-background border-primary/30"
                onClick={() => handleRoleSelection("student")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-[#FF8800] to-[#FF4000] rounded-full w-20 h-20 flex items-center justify-center">
                    <BookOpenText className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Sou Aluno</CardTitle>
                  <CardDescription className="text-base">
                    Quero estudar e praticar redação para vestibulares e ENEM
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Acesso a flashcards e quizzes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Correção de redações por IA e professores</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Acompanhamento de progresso</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Participação em turmas</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Card Professor */}
              <Card
                className="cursor-pointer transition-all hover:shadow-lg hover:scale-105 bg-gradient-to-br from-primary/10 to-background border-primary/30"
                onClick={() => handleRoleSelection("teacher")}
              >
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-[#FF8800] to-[#FF4000] rounded-full w-20 h-20 flex items-center justify-center">
                    <GraduationCap className="h-10 w-10 text-white" />
                  </div>
                  <CardTitle className="text-2xl">Sou Professor</CardTitle>
                  <CardDescription className="text-base">
                    Quero corrigir redações e gerenciar turmas de alunos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Gerenciamento de turmas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Correção assistida por IA</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Feedback por áudio e texto</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ChevronRight className="h-4 w-4 text-primary" />
                      <span>Relatórios de desempenho</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {step === 2 && selectedRole && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                {selectedRole === "student" ? "Perfil do Aluno" : "Perfil do Professor"}
              </h2>
              <p className="text-muted-foreground">
                Complete seu perfil para personalizar sua experiência na plataforma
              </p>
            </div>

            <Card className="bg-gradient-to-br from-primary/10 to-background border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {selectedRole === "student" ? <User className="h-5 w-5" /> : <School className="h-5 w-5" />}
                  Informações {selectedRole === "student" ? "do Aluno" : "do Professor"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {/* Campos comuns */}
                  <div>
                    <Label htmlFor="nome_completo">Nome Completo *</Label>
                    <Input
                      id="nome_completo"
                      value={profileData.nome_completo}
                      onChange={(e) => updateProfileData("nome_completo", e.target.value)}
                      placeholder="Digite seu nome completo"
                      required
                    />
                  </div>

                  {selectedRole === "student" && (
                    <>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="ano_escolar">Ano Escolar</Label>
                          <Select onValueChange={(value) => updateProfileData("ano_escolar", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione seu ano" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1ano">1º Ano do Ensino Médio</SelectItem>
                              <SelectItem value="2ano">2º Ano do Ensino Médio</SelectItem>
                              <SelectItem value="3ano">3º Ano do Ensino Médio</SelectItem>
                              <SelectItem value="cursinho">Cursinho Pré-vestibular</SelectItem>
                              <SelectItem value="superior">Ensino Superior</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="objetivo">Objetivo Principal</Label>
                          <Select onValueChange={(value) => updateProfileData("objetivo", value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seu objetivo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="enem">ENEM</SelectItem>
                              <SelectItem value="vestibular">Vestibular</SelectItem>
                              <SelectItem value="concurso">Concurso Público</SelectItem>
                              <SelectItem value="melhoria">Melhoria da Escrita</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="escola">Escola/Instituição</Label>
                        <Input
                          id="escola"
                          value={profileData.escola}
                          onChange={(e) => updateProfileData("escola", e.target.value)}
                          placeholder="Nome da sua escola ou cursinho"
                        />
                      </div>
                    </>
                  )}

                  {selectedRole === "teacher" && (
                    <>
                      <div>
                        <Label htmlFor="especialidade">Especialidade *</Label>
                        <Input
                          id="especialidade"
                          value={profileData.especialidade}
                          onChange={(e) => updateProfileData("especialidade", e.target.value)}
                          placeholder="Ex: Língua Portuguesa e Redação"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="formacao">Formação Acadêmica *</Label>
                        <Input
                          id="formacao"
                          value={profileData.formacao}
                          onChange={(e) => updateProfileData("formacao", e.target.value)}
                          placeholder="Ex: Licenciatura em Letras - USP"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="experiencia_anos">Anos de Experiência</Label>
                        <Input
                          id="experiencia_anos"
                          type="number"
                          value={profileData.experiencia_anos}
                          onChange={(e) => updateProfileData("experiencia_anos", e.target.value)}
                          placeholder="Ex: 10"
                          min="0"
                        />
                      </div>

                      <div>
                        <Label htmlFor="bio">Biografia Profissional</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => updateProfileData("bio", e.target.value)}
                          placeholder="Conte um pouco sobre sua experiência e metodologia de ensino..."
                          rows={4}
                        />
                      </div>
                    </>
                  )}

                  <div className="flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button type="submit" disabled={loading} className="flex-1">
                      {loading ? "Criando perfil..." : "Finalizar Cadastro"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
