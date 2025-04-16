"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PlusCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AIModelModal } from "@/components/ui/AIModelModal"
import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/store/useAuthStore"
import DashboardLayout from "../dashboard/layout"

interface AIModel {
  id: string
  type: "openai" | "ollama"
  name: string
  created_at: string
  api_key?: string
  ollama_url?: string
  ollama_model?: string
}

export default function AIModelsPage() {
  const router = useRouter()
  const { user } = useAuthStore()
  const { toast } = useToast()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [models, setModels] = useState<AIModel[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Kullanıcı giriş yapmamışsa login sayfasına yönlendir
  useEffect(() => {
    // localStorage kontrolü yaparak kullanıcı oturumunu doğrulama
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!userData || !token) {
      router.push('/login');
      return;
    }
    
    // Kullanıcı verilerini ayarla
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (!user && parsedUser) {
        useAuthStore.setState({ user: parsedUser });
      }
    }
    
    // Model listesini getir (user state değişmeden)
    fetchModels();
  }, [router]);

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
    if (user) {
      fetchModels()
    }
  }, [user])

  // Model kaydetme işlemi tamamlandığında
  const handleModelSaved = () => {
    fetchModels()
    toast({
      title: "Başarılı",
      description: "AI model başarıyla eklendi.",
    })
  }

  // Kullanıcı yoksa loading göster
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Yükleniyor...</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto max-w-7xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">AI Model Tanımları</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni Model Ekle
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="bg-muted/30 h-24" />
                <CardContent className="h-32 mt-4">
                  <div className="h-4 bg-muted/50 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted/50 rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : models.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <CardTitle>
                    {model.type === "openai" ? "ChatGPT (OpenAI)" : model.ollama_model}
                  </CardTitle>
                  <CardDescription>
                    {model.type === "openai" 
                      ? "OpenAI API ile entegre edilmiş model" 
                      : `Ollama ile çalışan ${model.ollama_model} modeli`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Model Türü:</span>
                      <span className="text-sm">{model.type === "openai" ? "OpenAI" : "Ollama"}</span>
                    </div>
                    
                    {model.type === "ollama" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Ollama URL:</span>
                          <span className="text-sm truncate ml-2 max-w-[150px]">{model.ollama_url}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Model:</span>
                          <span className="text-sm">{model.ollama_model}</span>
                        </div>
                      </>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Oluşturulma:</span>
                      <span className="text-sm">
                        {new Date(model.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground mb-4">
              Henüz tanımlanmış AI model bulunmuyor.
            </p>
            <Button onClick={() => setIsModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              İlk Modelinizi Ekleyin
            </Button>
          </Card>
        )}
      </div>

      <AIModelModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onModelSaved={handleModelSaved}
      />
    </DashboardLayout>
  )
} 