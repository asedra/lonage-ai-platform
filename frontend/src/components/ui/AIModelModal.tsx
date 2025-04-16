"use client"

import React, { useState, useEffect } from "react"
import { RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"

interface OllamaModel {
  name: string
}

interface AIModelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onModelSaved: () => void
}

export function AIModelModal({ open, onOpenChange, onModelSaved }: AIModelModalProps) {
  const { toast } = useToast()
  const [modelType, setModelType] = useState<"openai" | "ollama" | "">("")
  const [apiKey, setApiKey] = useState("")
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434")
  const [ollamaModel, setOllamaModel] = useState("")
  const [ollamaModels, setOllamaModels] = useState<OllamaModel[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingModels, setIsFetchingModels] = useState(false)

  // Model tipi değiştiğinde alanları sıfırla
  useEffect(() => {
    if (modelType !== "openai") {
      setApiKey("")
    }
    if (modelType !== "ollama") {
      setOllamaModel("")
    }
  }, [modelType])

  // Ollama modellerini getirme
  const handleFetchOllamaModels = async () => {
    if (!ollamaUrl) {
      toast({
        title: "Hata",
        description: "Ollama URL adresi girilmelidir.",
        variant: "destructive",
      })
      return
    }

    setIsFetchingModels(true)
    try {
      // URL'den trailing slash'ı kaldırma
      const baseUrl = ollamaUrl.endsWith("/") 
        ? ollamaUrl.slice(0, -1) 
        : ollamaUrl

      const response = await fetch(`${baseUrl}/api/tags`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data && data.models) {
        setOllamaModels(data.models)
      } else {
        // Farklı API yanıt formatlarını kontrol et
        let modelList = [];
        
        // Format 1: { models: [...] }
        if (Array.isArray(data.models)) {
          modelList = data.models;
        } 
        // Format 2: Düz model listesi
        else if (Array.isArray(data)) {
          modelList = data.map((name: string) => ({ name }));
        }
        // Format 3: { models: "model1,model2,..." }
        else if (typeof data.models === 'string') {
          modelList = data.models.split(',').map((name: string) => ({ name: name.trim() }));
        }
        
        if (modelList.length > 0) {
          setOllamaModels(modelList);
        } else {
          setOllamaModels([]);
          toast({
            title: "Uyarı",
            description: "Model listesi alınamadı veya hiç model bulunamadı.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Ollama modelleri getirilirken hata:", error)
      toast({
        title: "Bağlantı Hatası",
        description: "Ollama sunucusuna bağlanılamadı. URL'i kontrol edin.",
        variant: "destructive",
      })
      setOllamaModels([])
    } finally {
      setIsFetchingModels(false)
    }
  }

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!modelType) {
      toast({
        title: "Hata",
        description: "Lütfen bir model türü seçin.",
        variant: "destructive",
      })
      return
    }

    if (modelType === "openai" && !apiKey) {
      toast({
        title: "Hata",
        description: "API Key alanı boş bırakılamaz.",
        variant: "destructive",
      })
      return
    }

    if (modelType === "ollama") {
      if (!ollamaUrl) {
        toast({
          title: "Hata",
          description: "Ollama URL alanı boş bırakılamaz.",
          variant: "destructive",
        })
        return
      }
      
      if (!ollamaModel) {
        toast({
          title: "Hata",
          description: "Lütfen bir Ollama modeli seçin.",
          variant: "destructive",
        })
        return
      }
    }

    // Form verisini hazırla
    const formData = {
      type: modelType,
      name: modelType === "openai" ? "OpenAI" : ollamaModel,
      ...(modelType === "openai" && { api_key: apiKey }),
      ...(modelType === "ollama" && { 
        ollama_url: ollamaUrl,
        ollama_model: ollamaModel 
      }),
    }

    setIsLoading(true)
    try {
      // JWT token'ı localStorage'dan al
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }
      
      // API çağrısı
      const response = await fetch("/api/ai-models/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! Status: ${response.status}`);
      }

      toast({
        title: "Başarılı",
        description: "AI model başarıyla kaydedildi.",
      })
      
      // Formu sıfırla
      setModelType("")
      setApiKey("")
      setOllamaUrl("http://localhost:11434")
      setOllamaModel("")
      
      // Modal'ı kapat ve callback'i çağır
      onOpenChange(false)
      onModelSaved()
    } catch (error) {
      console.error("Model kaydedilirken hata:", error)
      toast({
        title: "Hata",
        description: error instanceof Error ? error.message : "Model kaydedilirken bir hata oluştu.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Yeni AI Model Ekle</DialogTitle>
            <DialogDescription>
              Kullanmak istediğiniz AI modelini seçin ve gerekli ayarları yapın.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Model Türü Seçimi */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="model-type" className="text-right">
                Model Türü
              </Label>
              <div className="col-span-3">
                <Select 
                  value={modelType} 
                  onValueChange={(value) => setModelType(value as "openai" | "ollama")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Bir model türü seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">ChatGPT (OpenAI)</SelectItem>
                    <SelectItem value="ollama">Ollama</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Model Tipine Göre Dinamik Alanlar */}
            {modelType === "openai" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="api-key" className="text-right">
                  API Key
                </Label>
                <div className="col-span-3">
                  <Input
                    id="api-key"
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="OpenAI API Anahtarınızı girin"
                  />
                </div>
              </div>
            )}

            {modelType === "ollama" && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ollama-url" className="text-right">
                    Ollama URL
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="ollama-url"
                      value={ollamaUrl}
                      onChange={(e) => setOllamaUrl(e.target.value)}
                      placeholder="http://localhost:11434"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ollama-model" className="text-right">
                    Ollama Model
                  </Label>
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="flex-1">
                      <Select 
                        value={ollamaModel} 
                        onValueChange={setOllamaModel}
                        disabled={ollamaModels.length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Bir model seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {ollamaModels.map((model) => (
                            <SelectItem key={model.name} value={model.name}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      size="icon" 
                      variant="ghost" 
                      type="button"
                      onClick={handleFetchOllamaModels}
                      disabled={isFetchingModels}
                    >
                      <RefreshCw className={`w-4 h-4 ${isFetchingModels ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 