import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useAssistantStore } from "@/store/useAssistantStore"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

// Form şeması Zod ile tanımlanıyor
const assistantFormSchema = z.object({
  name: z.string().min(3, {
    message: "Asistan adı en az 3 karakter olmalıdır.",
  }),
  role_description: z.string().min(10, {
    message: "Rol açıklaması en az 10 karakter olmalıdır.",
  }),
  base_prompt: z.string().min(20, {
    message: "Temel prompt en az 20 karakter olmalıdır.",
  }),
})

// Form değerlerinin tipi bu şemadan türetiliyor
type AssistantFormValues = z.infer<typeof assistantFormSchema>

// Modal'a geçirilecek prop tipleri
interface AssistantModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialData?: {
    id?: number
    name: string
    role_description: string
    base_prompt: string
  }
}

export function AssistantModal({ open, onOpenChange, initialData }: AssistantModalProps) {
  const { createAssistant, isLoading } = useAssistantStore()
  const [isEdit] = useState(!!initialData?.id)

  // Form için varsayılan değerler
  const defaultValues: Partial<AssistantFormValues> = {
    name: initialData?.name || "",
    role_description: initialData?.role_description || "",
    base_prompt: initialData?.base_prompt || "",
  }

  const form = useForm<AssistantFormValues>({
    resolver: zodResolver(assistantFormSchema),
    defaultValues,
  })

  function onSubmit(data: AssistantFormValues) {
    if (isEdit) {
      // Edit işlemi burada yapılacak
      console.log("Asistan güncelleniyor", data)
    } else {
      // Yeni asistan oluşturma
      createAssistant(data)
        .then(() => {
          onOpenChange(false)
          form.reset()
        })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Asistanı Düzenle" : "Yeni Asistan Oluştur"}
          </DialogTitle>
          <DialogDescription>
            Asistanınızın temel özelliklerini buradan ayarlayabilirsiniz.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asistan Adı</FormLabel>
                  <FormControl>
                    <Input placeholder="Müşteri Hizmetleri Asistanı" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="role_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rol Açıklaması</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Müşteri sorularını yanıtlayan ve destek sağlayan asistan" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="base_prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temel Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Sen bir müşteri hizmetleri temsilcisisin..."
                      className="resize-none min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                type="button"
              >
                İptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Yükleniyor..." : isEdit ? "Güncelle" : "Oluştur"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 