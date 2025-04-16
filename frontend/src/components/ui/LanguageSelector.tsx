import { useSettingsStore } from "@/store/useSettingsStore"
import { useState, useEffect, useCallback, memo } from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const LANGUAGES = [
  { value: "Türkçe", label: "Türkçe" },
  { value: "English", label: "English" },
  { value: "Deutsch", label: "Deutsch" },
  { value: "Français", label: "Français" },
  { value: "Español", label: "Español" },
] as const

// React.memo ile sarmalayarak gereksiz render'ları engelliyoruz
const LanguageSelectorComponent = ({ className }: { className?: string }) => {
  const { language, updateLanguage } = useSettingsStore()
  const [selectedLanguage, setSelectedLanguage] = useState<string>(language || "Türkçe")
  
  // Sadece bir kez çalışacak başlangıç ayarı
  useEffect(() => {
    // Eğer store'da bir dil değeri varsa, başlangıçta bunu kullan
    if (language && language !== selectedLanguage) {
      setSelectedLanguage(language)
    }
    // Boş dependency array ile sadece bir kez çalışır
  }, []);
  
  // useCallback ile fonksiyonu memoize ediyoruz, böylece her render'da yeniden oluşturulmuyor
  const handleLanguageChange = useCallback((value: string) => {
    if (value !== selectedLanguage) {
      setSelectedLanguage(value)
      updateLanguage(value)
    }
  }, [selectedLanguage, updateLanguage])
  
  // SelectTrigger'ı ayrı bir bileşene çıkardık böylece daha az render olacak
  const renderSelectTrigger = () => (
    <SelectTrigger className="w-full">
      <SelectValue placeholder="Bir dil seçin" />
    </SelectTrigger>
  )
  
  // SelectContent'i ayrı bir bileşene çıkardık
  const renderSelectContent = () => (
    <SelectContent>
      {LANGUAGES.map((lang) => (
        <SelectItem key={lang.value} value={lang.value}>
          {lang.label}
        </SelectItem>
      ))}
    </SelectContent>
  )

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Dil Seçenekleri</CardTitle>
        <CardDescription>
          Uygulama dilini buradan değiştirebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          defaultValue={selectedLanguage}
          value={selectedLanguage}
          onValueChange={handleLanguageChange}
        >
          {renderSelectTrigger()}
          {renderSelectContent()}
        </Select>
      </CardContent>
    </Card>
  )
}

// React.memo ile export edilen bileşeni sarmalıyoruz
export const LanguageSelector = memo(LanguageSelectorComponent) 