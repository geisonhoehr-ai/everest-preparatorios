'use client'

import React, { useState, useEffect } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Clock, BookOpen } from 'lucide-react'
import { FlashcardQuantityModalProps } from './types'

export default function FlashcardQuantityModal({
  topicName,
  totalFlashcards,
  onStartStudy,
  onClose
}: FlashcardQuantityModalProps) {
  const [selectedQuantity, setSelectedQuantity] = useState(5)
  const [isCustomQuantity, setIsCustomQuantity] = useState(false)
  const [maxFlashcards, setMaxFlashcards] = useState(50)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTotalFlashcards = async () => {
      setIsLoading(true)
      const total = typeof totalFlashcards === 'function' 
        ? await totalFlashcards() 
        : totalFlashcards
      setMaxFlashcards(total)
      setIsLoading(false)
    }

    fetchTotalFlashcards()
  }, [totalFlashcards])

  // Calcular tempo estimado de estudo
  const calculateEstimatedTime = (quantity: number) => {
    const minTime = quantity * 0.5  // 30 segundos por card
    const maxTime = quantity * 1.5  // 90 segundos por card
    return `${Math.round(minTime)} - ${Math.round(maxTime)} minutos`
  }

  const presetQuantities = [5, 10, 15, 20].filter(qty => qty <= maxFlashcards)

  if (isLoading) {
    return (
      <Dialog open onOpenChange={onClose}>
        <DialogContent>
          <DialogTitle className="sr-only">Carregando quantidade de flashcards</DialogTitle>
          <div className="text-center py-8">
            <p>Carregando...</p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Quantos cards você quer estudar?
          </DialogTitle>
          <DialogDescription className="text-center">
            Escolha a quantidade de flashcards para o tópico: 
            <span className="font-semibold ml-1">
              {topicName}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preset Quantities */}
          <div className="flex justify-center space-x-4">
            {presetQuantities.map((qty) => (
              <Button
                key={qty}
                variant={selectedQuantity === qty && !isCustomQuantity ? 'default' : 'outline'}
                onClick={() => {
                  setSelectedQuantity(qty)
                  setIsCustomQuantity(false)
                }}
              >
                {qty}
              </Button>
            ))}
          </div>

          {/* Custom Quantity Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Quantidade personalizada
              </span>
              <span className="font-semibold">
                {selectedQuantity}
              </span>
            </div>
            <Slider
              defaultValue={[5]}
              max={maxFlashcards}
              step={1}
              onValueChange={(value) => {
                setSelectedQuantity(value[0])
                setIsCustomQuantity(true)
              }}
            />
          </div>

          {/* Estimated Time */}
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Tempo estimado: {calculateEstimatedTime(selectedQuantity)}
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={onClose}
          >
            Cancelar
          </Button>
          <Button 
            onClick={() => onStartStudy(selectedQuantity)}
          >
            <BookOpen className="mr-2 h-4 w-4" /> Iniciar Sessão
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 