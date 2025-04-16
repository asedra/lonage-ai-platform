'use client'

import React, { useState } from 'react'
import { AssistantCard } from '@/components/ui/assistantCard'
import { AssistantModal } from '@/components/ui/assistantModal'
import { useAssistantStore } from '@/store/useAssistantStore'

// Bu sayfayı dinamik olarak işaretliyoruz, böylece statik olarak oluşturulmayacak
export const dynamic = 'force-dynamic'

export default function AssistantsPage() {
  const assistants = useAssistantStore((state) => state.assistants)
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">AI Asistanlarım</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Yeni Asistan Oluştur
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assistants.map((assistant) => (
          <AssistantCard key={assistant.id} assistant={assistant} />
        ))}
      </div>
      
      <AssistantModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
      />
    </div>
  )
} 