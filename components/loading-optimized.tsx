"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingOptimized() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simular carregamento mínimo
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black z-50 flex items-center justify-center"
          aria-label="Carregando página"
        >
          <div className="flex flex-col items-center space-y-4">
            {/* Logo animado */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full"
            />
            
            {/* Texto de loading */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-orange-500 font-semibold text-lg"
            >
              Everest Preparatórios
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
