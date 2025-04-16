import { useEffect, useState, memo, useCallback } from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type Theme = "light" | "dark" | "system"

const ThemeSelectorComponent = ({ className }: { className?: string }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // İlk değer olarak localStorage'dan tema değeri alınır
    if (typeof window !== "undefined") {
      return (localStorage.getItem("theme") as Theme) || "system"
    }
    return "system"
  })

  useEffect(() => {
    const root = window.document.documentElement
    
    // Kaydet
    localStorage.setItem("theme", theme)
    
    // System teması için
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.remove("light", "dark")
      root.classList.add(systemTheme)
      return
    }
    
    // Light/Dark teması için
    root.classList.remove("light", "dark")
    root.classList.add(theme)
  }, [theme])

  // useCallback ile tema değiştirme işlevini memoize ediyoruz
  const changeTheme = useCallback((newTheme: Theme) => {
    if (newTheme !== theme) {
      setTheme(newTheme)
    }
  }, [theme])

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Tema Seçenekleri</CardTitle>
        <CardDescription>
          Tema tercihlerinizi buradan ayarlayabilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={theme === "light" ? "default" : "outline"}
              className="w-full"
              onClick={() => changeTheme("light")}
            >
              Açık
            </Button>
            <Button
              variant={theme === "dark" ? "default" : "outline"}
              className="w-full"
              onClick={() => changeTheme("dark")}
            >
              Koyu
            </Button>
            <Button
              variant={theme === "system" ? "default" : "outline"}
              className="w-full"
              onClick={() => changeTheme("system")}
            >
              Sistem
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center">
            {theme === "system" 
              ? "Sistem ayarlarınıza göre tema otomatik değişir."
              : theme === "light" 
                ? "Açık tema seçildi."
                : "Koyu tema seçildi."}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// React.memo ile sarmalayarak performansı artırıyoruz
export const ThemeSelector = memo(ThemeSelectorComponent) 