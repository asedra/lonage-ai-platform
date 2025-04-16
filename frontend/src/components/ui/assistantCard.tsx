import { useState } from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AssistantModal } from "@/components/ui/assistantModal"

interface Assistant {
  id: number
  name: string
  role_description: string
  base_prompt: string
  created_at: string
  updated_at: string
}

interface AssistantCardProps {
  assistant: Assistant
  className?: string
  onChat?: (assistant: Assistant) => void
  onDelete?: (id: number) => void
}

export function AssistantCard({ assistant, className, onChat, onDelete }: AssistantCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  
  const formattedDate = new Date(assistant.updated_at).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  })
  
  return (
    <>
      <Card className={cn("w-full", className)}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-semibold truncate">{assistant.name}</span>
            <span className="text-xs text-muted-foreground">{`ID: ${assistant.id}`}</span>
          </CardTitle>
          <CardDescription>
            {assistant.role_description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm font-medium text-secondary-foreground">Temel Prompt:</p>
            <p className="text-sm text-muted-foreground line-clamp-3">
              {assistant.base_prompt}
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          <div className="w-full text-xs text-muted-foreground text-right">
            Son güncelleme: {formattedDate}
          </div>
          <div className="flex justify-between w-full">
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => onDelete?.(assistant.id)}
            >
              Sil
            </Button>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEditModalOpen(true)}
              >
                Düzenle
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => onChat?.(assistant)}
              >
                Sohbet Et
              </Button>
            </div>
          </div>
        </CardFooter>
      </Card>
      
      {/* Edit Modal */}
      <AssistantModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        initialData={assistant}
      />
    </>
  )
} 