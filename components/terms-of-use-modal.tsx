"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TermsOfUseModal({ isOpen, onClose }: TermsOfUseModalProps) {
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
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", duration: 0.3 }}
          className="bg-white text-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-orange-500 text-white p-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Termos de Uso</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-xl font-semibold text-gray-700 mb-3">1. Termos</h2>
              <p className="text-gray-600 mb-4">
                Ao acessar ao site <a href="everestpreparatorios.com.br" className="text-blue-600 hover:text-orange-500">Everest Preparatórios</a>, concorda em cumprir estes termos de serviço, todas as leis e regulamentos aplicáveis ​​e concorda que é responsável pelo cumprimento de todas as leis locais aplicáveis. Se você não concordar com algum desses termos, está proibido de usar ou acessar este site. Os materiais contidos neste site são protegidos pelas leis de direitos autorais e marcas comerciais aplicáveis.
              </p>

              <h2 className="text-xl font-semibold text-gray-700 mb-3">2. Uso de Licença</h2>
              <p className="text-gray-600 mb-3">
                É concedida permissão para baixar temporariamente uma cópia dos materiais (informações ou software) no site Everest Preparatórios, apenas para visualização transitória pessoal e não comercial. Esta é a concessão de uma licença, não uma transferência de título e, sob esta licença, você não pode:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-4">
                <li>modificar ou copiar os materiais;</li>
                <li>usar os materiais para qualquer finalidade comercial ou para exibição pública (comercial ou não comercial);</li>
                <li>tentar descompilar ou fazer engenharia reversa de qualquer software contido no site Everest Preparatórios;</li>
                <li>remover quaisquer direitos autorais ou outras notações de propriedade dos materiais; ou</li>
                <li>transferir os materiais para outra pessoa ou 'espelhe' os materiais em qualquer outro servidor.</li>
              </ol>
              <p className="text-gray-600 mb-4">
                Esta licença será automaticamente rescindida se você violar alguma dessas restrições e poderá ser rescindida por Everest Preparatórios a qualquer momento. Ao encerrar a visualização desses materiais ou após o término desta licença, você deve apagar todos os materiais baixados em sua posse, seja em formato eletrónico ou impresso.
              </p>

              <h2 className="text-xl font-semibold text-gray-700 mb-3">3. Isenção de responsabilidade</h2>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 mb-4">
                <li>
                  Os materiais no site da Everest Preparatórios são fornecidos 'como estão'. Everest Preparatórios não oferece garantias, expressas ou implícitas, e, por este meio, isenta e nega todas as outras garantias, incluindo, sem limitação, garantias implícitas ou condições de comercialização, adequação a um fim específico ou não violação de propriedade intelectual ou outra violação de direitos.
                </li>
                <li>
                  Além disso, o Everest Preparatórios não garante ou faz qualquer representação relativa à precisão, aos resultados prováveis ​​ou à confiabilidade do uso dos materiais em seu site ou de outra forma relacionado a esses materiais ou em sites vinculados a este site.
                </li>
              </ol>

              <h2 className="text-xl font-semibold text-gray-700 mb-3">4. Limitações</h2>
              <p className="text-gray-600 mb-4">
                Em nenhum caso o Everest Preparatórios ou seus fornecedores serão responsáveis ​​por quaisquer danos (incluindo, sem limitação, danos por perda de dados ou lucro ou devido a interrupção dos negócios) decorrentes do uso ou da incapacidade de usar os materiais em Everest Preparatórios, mesmo que Everest Preparatórios ou um representante autorizado da Everest Preparatórios tenha sido notificado oralmente ou por escrito da possibilidade de tais danos. Como algumas jurisdições não permitem limitações em garantias implícitas, ou limitações de responsabilidade por danos conseqüentes ou incidentais, essas limitações podem não se aplicar a você.
              </p>

              <h2 className="text-xl font-semibold text-gray-700 mb-3">5. Precisão dos materiais</h2>
              <p className="text-gray-600 mb-4">
                Os materiais exibidos no site da Everest Preparatórios podem incluir erros técnicos, tipográficos ou fotográficos. Everest Preparatórios não garante que qualquer material em seu site seja preciso, completo ou atual. Everest Preparatórios pode fazer alterações nos materiais contidos em seu site a qualquer momento, sem aviso prévio. No entanto, Everest Preparatórios não se compromete a atualizar os materiais.
              </p>

              <h2 className="text-xl font-semibold text-gray-700 mb-3">6. Links</h2>
              <p className="text-gray-600 mb-4">
                O Everest Preparatórios não analisou todos os sites vinculados ao seu site e não é responsável pelo conteúdo de nenhum site vinculado. A inclusão de qualquer link não implica endosso por Everest Preparatórios do site. O uso de qualquer site vinculado é por conta e risco do usuário.
              </p>

              <h3 className="text-lg font-semibold text-gray-700 mb-3">Modificações</h3>
              <p className="text-gray-600 mb-4">
                O Everest Preparatórios pode revisar estes termos de serviço do site a qualquer momento, sem aviso prévio. Ao usar este site, você concorda em ficar vinculado à versão atual desses termos de serviço.
              </p>

              <h3 className="text-lg font-semibold text-gray-700 mb-3">Lei aplicável</h3>
              <p className="text-gray-600">
                Estes termos e condições são regidos e interpretados de acordo com as leis do Everest Preparatórios e você se submete irrevogavelmente à jurisdição exclusiva dos tribunais naquele estado ou localidade.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 p-6 rounded-b-2xl">
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-orange-500 text-white rounded-lg hover:from-blue-700 hover:to-orange-600 transition-all duration-200 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
