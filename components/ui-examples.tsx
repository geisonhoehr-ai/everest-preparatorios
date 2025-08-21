"use client";

import { Sparkles } from "@/components/aceternity";
import { MagicCard } from "@/components/magicui";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const UIExamples = () => {
  return (
    <div className="space-y-8 p-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        🎨 Exemplos de Componentes UI
      </h2>

      {/* Aceternity UI - Sparkles */}
      <div className="relative">
        <h3 className="text-xl font-semibold mb-4">✨ Aceternity UI - Sparkles</h3>
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg overflow-hidden">
          <Sparkles
            background="#ffffff"
            minSize={0.5}
            maxSize={1.5}
            speed={0.5}
            particleCount={20}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-white font-medium">Efeito Sparkles</p>
          </div>
        </div>
      </div>

      {/* Magic UI - MagicCard */}
      <div>
        <h3 className="text-xl font-semibold mb-4">🎭 Magic UI - MagicCard</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MagicCard className="bg-gradient-to-br from-blue-50 to-indigo-100">
            <h4 className="text-lg font-semibold mb-2">Card Mágico 1</h4>
            <p className="text-gray-600">
              Este card tem efeitos 3D e gradientes que reagem ao movimento do mouse.
            </p>
          </MagicCard>
          
          <MagicCard className="bg-gradient-to-br from-pink-50 to-rose-100">
            <h4 className="text-lg font-semibold mb-2">Card Mágico 2</h4>
            <p className="text-gray-600">
              Passe o mouse sobre os cards para ver os efeitos de rotação e brilho.
            </p>
          </MagicCard>
        </div>
      </div>

      {/* Combinação com Shadcn/ui */}
      <div>
        <h3 className="text-xl font-semibold mb-4">🎯 Combinação com Shadcn/ui</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0">
              <Sparkles
                background="#3b82f6"
                minSize={0.3}
                maxSize={0.8}
                speed={0.3}
                particleCount={15}
              />
            </div>
            <CardHeader>
              <CardTitle className="relative z-10">Card com Sparkles</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <p>Este card combina Shadcn/ui com Aceternity UI.</p>
            </CardContent>
          </Card>

          <MagicCard className="bg-white">
            <CardHeader className="p-0">
              <CardTitle>Card Mágico</CardTitle>
            </CardHeader>
            <CardContent className="p-0 mt-4">
              <p>Este card combina Magic UI com Shadcn/ui.</p>
            </CardContent>
          </MagicCard>

          <Card>
            <CardHeader>
              <CardTitle>Card Tradicional</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Card padrão do Shadcn/ui para comparação.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Botões com efeitos */}
      <div>
        <h3 className="text-xl font-semibold mb-4">🚀 Botões com Efeitos</h3>
        <div className="flex flex-wrap gap-4">
          <Button className="relative overflow-hidden">
            <span className="relative z-10">Botão Normal</span>
            <div className="absolute inset-0">
              <Sparkles
                background="#ffffff"
                minSize={0.2}
                maxSize={0.6}
                speed={0.8}
                particleCount={8}
              />
            </div>
          </Button>

          <MagicCard className="p-0 inline-block">
            <Button variant="outline" className="border-0 bg-transparent">
              Botão Mágico
            </Button>
          </MagicCard>

          <Button variant="secondary">
            Botão Secundário
          </Button>
        </div>
      </div>
    </div>
  );
};
