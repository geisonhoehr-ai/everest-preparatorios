"use client";

import { useState } from "react";
import { X, Shield, Lock, Eye, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyPolicyModal({ isOpen, onClose }: PrivacyPolicyModalProps) {
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700/50 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-b border-slate-700/50 rounded-t-2xl p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Política de Privacidade</h2>
                  <p className="text-slate-400">Everest Preparatórios</p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 hover:bg-slate-700/50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-slate-400" />
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Introdução */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Introdução</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Esta Política de Privacidade descreve como o Everest Preparatórios coleta, usa e protege suas informações pessoais quando você utiliza nossos serviços educacionais.
              </p>
            </div>

            {/* Informações Coletadas */}
            <div className="bg-gradient-to-r from-green-500/10 to-green-600/10 border border-green-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Informações que Coletamos</h3>
              </div>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Dados Pessoais:</strong> Nome, e-mail, telefone, CPF</p>
                <p><strong>• Dados Acadêmicos:</strong> Histórico escolar, resultados de simulados</p>
                <p><strong>• Dados de Uso:</strong> Tempo de estudo, páginas visitadas, progresso</p>
                <p><strong>• Dados Técnicos:</strong> IP, dispositivo, navegador, sistema operacional</p>
              </div>
            </div>

            {/* Como Usamos */}
            <div className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border border-purple-500/20 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Como Usamos suas Informações</h3>
              </div>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Fornecer Serviços:</strong> Acesso aos cursos, simulados e materiais</p>
                <p><strong>• Comunicação:</strong> Atualizações, suporte e informações importantes</p>
                <p><strong>• Melhorias:</strong> Análise de uso para otimizar a plataforma</p>
                <p><strong>• Segurança:</strong> Proteção contra fraudes e uso indevido</p>
              </div>
            </div>

            {/* Compartilhamento */}
            <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Compartilhamento de Informações</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Não vendemos</strong> suas informações pessoais</p>
                <p><strong>• Compartilhamos apenas:</strong></p>
                <ul className="ml-6 space-y-1">
                  <li>• Com prestadores de serviços essenciais (pagamento, hospedagem)</li>
                  <li>• Quando exigido por lei ou ordem judicial</li>
                  <li>• Com seu consentimento explícito</li>
                </ul>
              </div>
            </div>

            {/* Segurança */}
            <div className="bg-gradient-to-r from-red-500/10 to-red-600/10 border border-red-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Segurança dos Dados</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Criptografia:</strong> Dados transmitidos e armazenados com segurança</p>
                <p><strong>• Acesso Restrito:</strong> Apenas funcionários autorizados</p>
                <p><strong>• Monitoramento:</strong> Sistemas de segurança 24/7</p>
                <p><strong>• Backup:</strong> Cópias de segurança regulares</p>
              </div>
            </div>

            {/* Seus Direitos */}
            <div className="bg-gradient-to-r from-teal-500/10 to-teal-600/10 border border-teal-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Seus Direitos</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Acesso:</strong> Solicitar cópia de seus dados</p>
                <p><strong>• Correção:</strong> Atualizar informações incorretas</p>
                <p><strong>• Exclusão:</strong> Solicitar remoção de dados</p>
                <p><strong>• Portabilidade:</strong> Transferir dados para outro serviço</p>
                <p><strong>• Revogação:</strong> Cancelar consentimentos dados</p>
              </div>
            </div>

            {/* Cookies */}
            <div className="bg-gradient-to-r from-indigo-500/10 to-indigo-600/10 border border-indigo-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Cookies e Tecnologias Similares</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Cookies Essenciais:</strong> Funcionamento básico da plataforma</p>
                <p><strong>• Cookies de Performance:</strong> Análise de uso e melhorias</p>
                <p><strong>• Cookies de Marketing:</strong> Anúncios relevantes (com consentimento)</p>
                <p><strong>• Controle:</strong> Gerenciar preferências no navegador</p>
              </div>
            </div>

            {/* Retenção */}
            <div className="bg-gradient-to-r from-pink-500/10 to-pink-600/10 border border-pink-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Retenção de Dados</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Dados Ativos:</strong> Mantidos enquanto sua conta estiver ativa</p>
                <p><strong>• Dados Inativos:</strong> Removidos após 2 anos de inatividade</p>
                <p><strong>• Dados Legais:</strong> Mantidos conforme exigido por lei</p>
                <p><strong>• Exclusão:</strong> Processo completo em até 30 dias</p>
              </div>
            </div>

            {/* Menores de Idade */}
            <div className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Menores de Idade</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Idade Mínima:</strong> 13 anos para uso independente</p>
                <p><strong>• Consentimento:</strong> Pais/responsáveis para menores de 18 anos</p>
                <p><strong>• Supervisão:</strong> Monitoramento de atividades</p>
                <p><strong>• Proteção:</strong> Dados tratados com cuidado especial</p>
              </div>
            </div>

            {/* Transferências */}
            <div className="bg-gradient-to-r from-cyan-500/10 to-cyan-600/10 border border-cyan-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Transferências Internacionais</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Servidores:</strong> Localizados no Brasil e Estados Unidos</p>
                <p><strong>• Proteção:</strong> Acordos de proteção de dados</p>
                <p><strong>• Conformidade:</strong> LGPD e regulamentações locais</p>
                <p><strong>• Transparência:</strong> Informações sobre localização</p>
              </div>
            </div>

            {/* Alterações */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border border-emerald-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Alterações na Política</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• Notificação:</strong> Mudanças comunicadas por e-mail</p>
                <p><strong>• Revisão:</strong> Política atualizada regularmente</p>
                <p><strong>• Aceitação:</strong> Uso continuado indica concordância</p>
                <p><strong>• Histórico:</strong> Versões anteriores disponíveis</p>
              </div>
            </div>

            {/* Contato */}
            <div className="bg-gradient-to-r from-violet-500/10 to-violet-600/10 border border-violet-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Entre em Contato</h3>
              <div className="space-y-3 text-slate-300">
                <p><strong>• E-mail:</strong> privacidade@everestpreparatorios.com</p>
                <p><strong>• WhatsApp:</strong> (55) 98 1554-0377</p>
                <p><strong>• Endereço:</strong> Brasil</p>
                <p><strong>• Horário:</strong> Segunda a Sexta, 8h às 18h</p>
              </div>
            </div>

            {/* Data de Vigência */}
            <div className="bg-gradient-to-r from-rose-500/10 to-rose-600/10 border border-rose-500/20 rounded-xl p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Data de Vigência</h3>
              <p className="text-slate-300">
                Esta política entra em vigor em <strong>1º de janeiro de 2025</strong> e permanece válida até que seja alterada.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-sm border-t border-slate-700/50 rounded-b-2xl p-6">
            <div className="flex items-center justify-between">
              <p className="text-slate-400 text-sm">
                Última atualização: 1º de janeiro de 2025
              </p>
              <Button
                onClick={onClose}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-2 rounded-xl transition-all duration-300"
              >
                Fechar
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
