"use client"

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ChatHeader } from './ChatHeader'
import { ChatMessageList } from './ChatMessageList'
import { ChatInput } from './ChatInput'
import { ChatMessageProps } from './ChatMessage'
import { AIModelSelector } from './AIModelSelector'
import { Badge } from '@/components/ui/badge'
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

interface ChatWrapperProps {
  initialMessages?: ChatMessageProps[]
  className?: string
  headerTitle?: string
  headerDescription?: string
  headerIcon?: React.ReactNode
}

export function ChatWrapper({
  initialMessages = [],
  className,
  headerTitle,
  headerDescription,
  headerIcon,
}: ChatWrapperProps) {
  const [messages, setMessages] = useState<ChatMessageProps[]>(initialMessages)
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null)
  const { toast } = useToast()

  // AI Model seçildiğinde
  const handleModelSelect = (model: AIModel | null) => {
    setSelectedModel(model)
  }

  // Yeni kullanıcı mesajı ekleme
  const handleSendMessage = async (content: string) => {
    if (!selectedModel) {
      toast({
        title: "Hata",
        description: "Lütfen önce bir AI modeli seçin",
        variant: "destructive",
      })
      return
    }

    // Kullanıcı mesajı ekle
    const userMessage: ChatMessageProps = {
      id: Date.now(),
      role: 'user',
      content,
    }
    
    setMessages((prev) => [...prev, userMessage])
    
    // API çağrısı
    setIsGenerating(true)
    
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('Oturum bulunamadı')
      }

      // Chat API'ye istek gönder
      const messageHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }))

      const payload = selectedModel.type === "openai" 
        ? {
            model_type: "openai",
            model: "gpt-4",
            api_key: selectedModel.api_key,
            messages: messageHistory
          }
        : {
            model_type: "ollama",
            model: selectedModel.ollama_model,
            ollama_url: selectedModel.ollama_url,
            messages: messageHistory
          }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        throw new Error('API yanıt vermedi')
      }

      const data = await response.json()
      
      // Assistant mesajını ekle
      const assistantMessage: ChatMessageProps = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.content || data.response || "Üzgünüm, bir cevap üretemiyorum.",
      }
      
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      console.error('Mesaj gönderilirken hata:', error)
      toast({
        title: "Hata",
        description: "Mesaj gönderilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card className={cn("grid h-[600px] grid-rows-[auto_auto_1fr_auto]", className)}>
      <ChatHeader 
        title={headerTitle} 
        description={headerDescription} 
        icon={headerIcon} 
      />
      
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <AIModelSelector 
            onModelSelect={handleModelSelect}
            selectedModelId={selectedModel?.id}
          />
          
          {selectedModel && (
            <Badge variant="outline">
              Kullanılan Model: {selectedModel.type === "openai" ? "GPT" : selectedModel.ollama_model}
            </Badge>
          )}
        </div>
      </div>
      
      <div className="overflow-hidden">
        <ChatMessageList 
          messages={messages} 
          isGenerating={isGenerating} 
        />
      </div>
      
      <ChatInput 
        onSubmit={handleSendMessage}
        isGenerating={isGenerating}
        disabled={!selectedModel}
      />
    </Card>
  )
} 