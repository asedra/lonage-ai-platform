"use client"

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ShadCN UI bileşenleri
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Store
import { useAuthStore } from '@/store/useAuthStore';

export default function Login() {
  const router = useRouter();
  const { login, isLoading, error, setError } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirecting, setRedirecting] = useState(false);
  
  // Auth durumunu kontrol et - eğer zaten giriş yapılmışsa dashboard'a yönlendir
  useEffect(() => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (user && token) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      console.log('Login isteği gönderiliyor:', { email, password });
      
      // Auth store ile login işlemi
      await login({ email, password });
      
      // Yönlendirme başlıyor
      setRedirecting(true);
      console.log('Dashboard sayfasına yönlendiriliyor...');
      
      // Yönlendirmeyi timeout ile geciktir
      setTimeout(() => {
        try {
          // Önce router.push ile dene
          router.push('/dashboard');
          
          // Eğer router.push çalışmazsa window.location kullan
          setTimeout(() => {
            if (window.location.pathname !== '/dashboard') {
              window.location.href = '/dashboard';
            }
          }, 500);
        } catch (e) {
          console.error('Yönlendirme hatası:', e);
          window.location.href = '/dashboard';
        }
      }, 1000);
      
    } catch (err: unknown) {
      // Hata zaten AuthStore'a kaydedilmiş olacak
      console.error('Login hatası:', err);
      setRedirecting(false);
    }
  };

  if (redirecting) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <p className="text-center text-muted-foreground">Dashboard&apos;a yönlendiriliyorsunuz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[380px] shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Lonage - Giriş</CardTitle>
          <CardDescription>
            Hesabınızla giriş yapın
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta Adresi</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex flex-col">
          <p className="text-xs text-muted-foreground text-center mt-2">
            Demo kullanıcı: admin@lonage.com / admin123
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 