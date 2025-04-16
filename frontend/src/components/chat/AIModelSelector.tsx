"use client"

import React, { useEffect, useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/components/ui/use-toast'

interface AIModel {
  id: string
  type: "openai" | "ollama"
  name: string
  created_at: string
  api_key?: string
  ollama_url?: string
  ollama_model?: string
}

interface AIModelSelectorProps {
  onModelSelect: (model: AIModel | null) => void
  selectedModelId?: string
  className?: string
}

export function AIModelSelector({ 
  onModelSelect, 
  selectedModelId, 
  className 
}: AIModelSelectorProps) {
  const [models, setModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  // Model listesini getir
  const fetchModels = async () => {
    setIsLoading(true)
    try {
      // JWT token'ı localStorage'dan al
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }
      
      const response = await fetch("/api/ai-models/", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      setModels(data || [])
    } catch (error) {
      console.error("Model listesi alınırken hata:", error)
      toast({
        title: "Hata",
        description: "Model listesi alınırken bir hata oluştu.",
        variant: "destructive",
      })
      setModels([])
    } finally {
      setIsLoading(false)
    }
  }

  // Sayfa yüklendiğinde modelleri getir
  useEffect(() => {
    fetchModels()
  }, [])

  // Seçilen model değiştiğinde
  const handleModelChange = (value: string) => {
    const selectedModel = models.find(model => model.id === value) || null
    onModelSelect(selectedModel)
  }

  return (
    <div className={className}>
      <Select
        value={selectedModelId}
        onValueChange={handleModelChange}
        disabled={isLoading || models.length === 0}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Lütfen bir AI modeli seçin" />
        </SelectTrigger>
        <SelectContent>
          {models.map((model) => (
            <SelectItem key={model.id} value={model.id}>
              {model.type === "openai" 
                ? "OpenAI - GPT" 
                : `Ollama - ${model.ollama_model}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
} 