"use client"

import React from 'react'
import { Card, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ChatHeaderProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  className?: string
}

export function ChatHeader({
  title = "AI Asistan",
  description = "OpenAI tarafından desteklenen yapay zeka asistanınız.",
  icon,
  className,
}: ChatHeaderProps) {
  return (
    <Card className={cn("rounded-none border-b", className)}>
      <CardHeader className="flex flex-row items-center gap-3">
        {icon && <div className="flex h-8 w-8 items-center justify-center">{icon}</div>}
        <div className="flex flex-col">
          <div className="font-semibold">{title}</div>
          <div className="text-sm text-muted-foreground">{description}</div>
        </div>
      </CardHeader>
    </Card>
  )
} 