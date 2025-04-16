"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from "@/lib/utils";

// ShadCN UI bileşenleri
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Client tarafında localStorage kontrolü
    const checkAuth = () => {
      try {
        const userData = localStorage.getItem('user');
        const token = localStorage.getItem('token');

        if (!userData || !token) {
          console.log('Kullanıcı girişi yok, login sayfasına yönlendiriliyor...');
          router.push('/login');
          return;
        }

        // Kullanıcı verilerini ayarla
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Auth kontrolü sırasında hata:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  // Çıkış işlemi
  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex flex-col h-screen overflow-hidden bg-background"
    )}>
      {/* Üst Navigasyon */}
      <nav className={cn(
        "border-b bg-card z-10"
      )}>
        <div className={cn(
          "w-full px-4 md:px-8 lg:px-12",
          "flex h-16 items-center"
        )}>
          <h1 className="text-xl font-semibold">Lonage - AI Asistan Platformu</h1>
          <div className="ml-auto flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              {user?.email}
            </span>
            <Button 
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              Çıkış Yap
            </Button>
          </div>
        </div>
      </nav>
      
      {/* Ana İçerik Alanı - Scroll edilebilir */}
      <main className={cn(
        "flex-1 overflow-auto",
        "px-4 md:px-8 lg:px-12 py-6"
      )}>
        <div className={cn(
          "w-full",
          "space-y-6"
        )}>
          {/* Hoşgeldin kartı */}
          <Card className={cn("shadow-sm")}>
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl font-bold">
                Hoş Geldiniz, {user?.name}!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bu dashboard sayfasında uygulamanın genel durumunu görebilir ve yönetebilirsiniz.
              </p>
            </CardContent>
          </Card>
          
          <h2 className="text-xl font-semibold mt-6">Platform Özeti</h2>
          <Separator className="my-2" />
          
          <div className={cn(
            "grid gap-4",
            "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
          )}>
            <Card className={cn("h-full min-h-[180px]")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Asistanlar</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">5</div>
                <p className="text-xs text-muted-foreground">
                  Toplam oluşturulan asistan sayısı
                </p>
              </CardContent>
            </Card>
            
            <Card className={cn("h-full min-h-[180px]")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Kullanıcılar</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">3</div>
                <p className="text-xs text-muted-foreground">
                  Toplam aktif kullanıcı sayısı
                </p>
              </CardContent>
            </Card>
            
            <Card className={cn("h-full min-h-[180px]")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Krediler</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4,250</div>
                <p className="text-xs text-muted-foreground">
                  Kalan kredi miktarı
                </p>
              </CardContent>
            </Card>
            
            <Card className={cn("h-full min-h-[180px]")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Konuşmalar</CardTitle>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  className="h-4 w-4 text-muted-foreground"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">127</div>
                <p className="text-xs text-muted-foreground">
                  Toplam konuşma sayısı
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className={cn(
            "grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
          )}>
            <div className={cn(
              "lg:col-span-2"
            )}>
              <h2 className="text-xl font-semibold mb-2">Son İşlemler</h2>
              <Separator className="mb-4" />
              
              <Card className={cn("h-full")}>
                <CardHeader>
                  <CardTitle>Son İşlemler</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Yeni Asistan Oluşturma</p>
                        <p className="text-sm text-muted-foreground">2 saat önce</p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">Başarılı</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">Doküman Yükleme</p>
                        <p className="text-sm text-muted-foreground">Dün</p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">Başarılı</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Kredi Satın Alma</p>
                        <p className="text-sm text-muted-foreground">28.03.2023</p>
                      </div>
                      <div className="text-right">
                        <span className="rounded-full px-2 py-1 text-xs bg-green-100 text-green-800">Başarılı</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h2 className="text-xl font-semibold mb-2">Haftalık Kullanım</h2>
              <Separator className="mb-4" />
              
              <Card className={cn("h-full")}>
                <CardHeader>
                  <CardTitle>Kullanım İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Tüketilen Toplam Token</p>
                        <p className="text-sm font-medium">1,250</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-1/3 rounded-full bg-primary"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">Cevaplanmış Sorular</p>
                        <p className="text-sm font-medium">42</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-2/3 rounded-full bg-primary"></div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">API Çağrıları</p>
                        <p className="text-sm font-medium">87</p>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-full w-1/2 rounded-full bg-primary"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 