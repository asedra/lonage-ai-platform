"use client"

import React, { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

interface ChatInputProps {
  onSubmit: (value: string) => void
  isGenerating?: boolean
  placeholder?: string
  className?: string
  inputClassName?: string
  disabled?: boolean
}

export function ChatInput({
  onSubmit,
  isGenerating = false,
  placeholder = "Mesajınızı yazın...",
  className,
  inputClassName,
  disabled = false,
}: ChatInputProps) {
  const [input, setInput] = useState<string>('')

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!input.trim() || isGenerating || disabled) return
    
    onSubmit(input)
    setInput('')
  }

  // Enter ile gönderme, shift+enter ile yeni satır
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = e.currentTarget.form
      if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex w-full items-end gap-2 border-t bg-background p-4", className)}
    >
      <Textarea
        placeholder={placeholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "min-h-10 resize-none border focus-visible:ring-0",
          inputClassName
        )}
        rows={1}
        disabled={isGenerating || disabled}
      />
      <Button 
        type="submit" 
        disabled={isGenerating || !input.trim() || disabled}
        size="icon"
        className="h-10 w-10"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-4 w-4"
        >
          <path d="m22 2-7 20-4-9-9-4Z" />
          <path d="M22 2 11 13" />
        </svg>
        <span className="sr-only">Gönder</span>
      </Button>
      {isGenerating && (
        <Button 
          variant="outline" 
          size="icon" 
          className="h-10 w-10"
          type="button"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <rect width="16" height="16" x="4" y="4" rx="2" />
          </svg>
          <span className="sr-only">Durdur</span>
        </Button>
      )}
    </form>
  )
} 