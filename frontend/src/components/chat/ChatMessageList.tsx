"use client"

import React, { useEffect, useRef } from 'react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ChatMessage, ChatMessageProps } from './ChatMessage'
import { cn } from '@/lib/utils'

interface ChatMessageListProps {
  messages: ChatMessageProps[]
  isGenerating?: boolean
  className?: string
}

export function ChatMessageList({
  messages = [],
  isGenerating = false,
  className,
}: ChatMessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Yeni mesaj geldiğinde aşağı scroll
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current
      scrollArea.scrollTo({
        top: scrollArea.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages])

  if (!messages.length) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground">
        <div className="flex flex-col items-center gap-2">
          <p>Henüz mesaj yok.</p>
          <p className="text-sm">Bir mesaj göndererek sohbeti başlatın.</p>
        </div>
      </div>
    )
  }

  return (
    <ScrollArea 
      ref={scrollAreaRef} 
      className={cn('h-full', className)}
    >
      <div className="flex flex-col">
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            id={message.id}
            role={message.role}
            content={message.content}
            isLoading={message.isLoading}
          />
        ))}
        {isGenerating && (
          <ChatMessage
            id="generating"
            role="assistant"
            content="Yazmaya devam ediyor..."
            isLoading={true}
          />
        )}
      </div>
    </ScrollArea>
  )
} 