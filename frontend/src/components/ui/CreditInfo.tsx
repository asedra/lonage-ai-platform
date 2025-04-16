import { useEffect, useState } from "react"

import { cn } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface CreditInfoProps {
  className?: string
}

interface CreditData {
  total: number
  used: number
  lastUpdated: string
}

export function CreditInfo({ className }: CreditInfoProps) {
  const [credits, setCredits] = useState<CreditData>({
    total: 1000,
    used: 450,
    lastUpdated: new Date().toISOString()
  })
  
  const [isLoading, setIsLoading] = useState(false)
  
  const percentage = Math.round((credits.used / credits.total) * 100)
  const remaining = credits.total - credits.used
  
  const formattedDate = new Date(credits.lastUpdated).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
  
  function refreshCredits() {
    setIsLoading(true)
    
    // API'den kredi bilgilerini çekmek için simüle edilmiş bir işlem
    setTimeout(() => {
      setCredits({
        ...credits,
        lastUpdated: new Date().toISOString()
      })
      setIsLoading(false)
    }, 1000)
  }
  
  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Kredi Bilgileriniz</CardTitle>
        <CardDescription>
          Kalan kullanım kredilerinizi ve tüketim durumunuzu buradan görebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Kullanılan: {credits.used} kredi</span>
            <span className="text-sm font-medium">Toplam: {credits.total} kredi</span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>%{percentage} kullanıldı</span>
            <span>{remaining} kredi kaldı</span>
          </div>
        </div>
        
        <div className="rounded-md bg-muted p-4">
          <div className="grid gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Kullanım Durumu:</span>
              <span className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                percentage > 90 
                  ? "bg-destructive/15 text-destructive" 
                  : percentage > 70 
                    ? "bg-amber-500/15 text-amber-500" 
                    : "bg-primary/15 text-primary"
              )}>
                {percentage > 90 
                  ? "Kritik" 
                  : percentage > 70 
                    ? "Dikkat" 
                    : "İyi"}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              Son güncelleme: {formattedDate}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={refreshCredits} 
          disabled={isLoading} 
          variant="outline" 
          className="w-full"
        >
          {isLoading ? "Yükleniyor..." : "Kredi Bilgilerini Güncelle"}
        </Button>
      </CardFooter>
    </Card>
  )
} 