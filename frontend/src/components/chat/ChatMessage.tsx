"use client"

import React from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/avatar'

export interface ChatMessageProps {
  id: number | string
  role: 'user' | 'assistant'
  content: string
  isLoading?: boolean
  className?: string
}

export function ChatMessage({
  role,
  content,
  isLoading,
  className,
}: ChatMessageProps) {
  return (
    <div
      className={cn(
        'flex w-full items-start gap-4 p-4',
        role === 'user' ? 'bg-muted/50' : 'bg-background',
        isLoading && 'opacity-50',
        className
      )}
    >
      <Avatar className="h-8 w-8">
        <div className={cn(
          "flex h-full w-full items-center justify-center rounded-full",
          role === 'user' ? "bg-primary" : "bg-primary/20"
        )}>
          {role === 'user' ? (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-primary-foreground"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ) : (
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="16" height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-primary"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          )}
        </div>
      </Avatar>
      <div className="flex-1 overflow-hidden">
        <div className="prose dark:prose-invert max-w-none break-words">
          {content}
        </div>
      </div>
    </div>
  )
} 