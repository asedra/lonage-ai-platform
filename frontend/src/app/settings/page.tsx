'use client'

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { ProfileForm } from '@/components/ui/ProfileForm';
import { LanguageSelector } from '@/components/ui/LanguageSelector';
import { ThemeSelector } from '@/components/ui/ThemeSelector';
import { CreditInfo } from '@/components/ui/CreditInfo';
import { useAuthStore } from '@/store/useAuthStore';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const [userProfile, setUserProfile] = useState({ name: '', surname: '', email: '' });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  // API'den kullanıcı bilgilerini alma fonksiyonu - useCallback ile optimize edildi
  const fetchUserFromApi = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        toast({
          title: "Oturum Hatası",
          description: "Oturumunuz sonlanmış, lütfen tekrar giriş yapın.",
          variant: "destructive"
        });
        router.push('/login');
        return;
      }
      
      try {
        const response = await fetch('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          
          // İsim ve soyisim ayırma
          const nameParts = userData.name?.split(' ') || ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          setUserProfile({
            name: firstName,
            surname: lastName,
            email: userData.email || ''
          });
        } else {
          // API hatası durumunda alternatif olarak localStorage'daki bilgiyi kullan
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser);
              // İsim ve soyisim ayırma
              const nameParts = parsedUser.name?.split(' ') || ['', ''];
              const firstName = nameParts[0] || '';
              const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
              
              setUserProfile({
                name: firstName,
                surname: lastName,
                email: parsedUser.email || ''
              });
            } catch (e) {
              console.error("Depolanan kullanıcı bilgisi ayrıştırılamadı:", e);
              toast({
                title: "Profil Bilgisi Alınamadı",
                description: "Kullanıcı bilgileri yüklenirken bir hata oluştu.",
                variant: "destructive"
              });
            }
          } else {
            // Hem API hem localStorage başarısız oldu
            toast({
              title: "Profil Bilgisi Alınamadı",
              description: "Kullanıcı bilgileri yüklenirken bir hata oluştu.",
              variant: "destructive"
            });
            router.push('/login');
          }
        }
      } catch (error) {
        console.error("API isteği sırasında hata:", error);
        // API hatası durumunda alternatif olarak localStorage'daki bilgiyi kullan
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            // İsim ve soyisim ayırma
            const nameParts = parsedUser.name?.split(' ') || ['', ''];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
            
            setUserProfile({
              name: firstName,
              surname: lastName,
              email: parsedUser.email || ''
            });
          } catch (e) {
            console.error("Depolanan kullanıcı bilgisi ayrıştırılamadı:", e);
            toast({
              title: "Profil Bilgisi Alınamadı",
              description: "Kullanıcı bilgileri yüklenirken bir hata oluştu.",
              variant: "destructive"
            });
          }
        }
      }
    } catch (error) {
      console.error("Kullanıcı bilgileri alınırken genel hata:", error);
      toast({
        title: "Hata",
        description: "Bir bağlantı hatası oluştu",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [router, setUser, toast]);

  // Kullanıcı bilgilerini tek bir useEffect içinde yönetiyoruz
  useEffect(() => {
    const initUser = async () => {
      // İlk olarak localStorage'dan kullanıcı bilgilerini kontrol edelim
      const storedUser = localStorage.getItem('user');
      
      if (storedUser && !user) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          
          // İsim ve soyisim ayırma
          const nameParts = parsedUser.name?.split(' ') || ['', ''];
          const firstName = nameParts[0] || '';
          const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
          
          setUserProfile({
            name: firstName, 
            surname: lastName,
            email: parsedUser.email || ''
          });
          setIsLoading(false);
        } catch (e) {
          console.error("Depolanan kullanıcı bilgisi ayrıştırılamadı:", e);
          // localStorage'dan alınamadıysa API'den almayı deneyelim
          await fetchUserFromApi();
        }
      } else if (user) {
        // Kullanıcı zaten varsa profil bilgilerini işle
        const nameParts = user.name?.split(' ') || ['', ''];
        const firstName = nameParts[0] || '';
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        
        setUserProfile({
          name: firstName,
          surname: lastName,
          email: user.email || ''
        });
        setIsLoading(false);
      } else {
        // Kullanıcı yoksa API'den bilgileri al
        await fetchUserFromApi();
      }
    };
    
    initUser();
    // Sadece component mount olduğunda çalışsın
  }, []); // Boş dependency array ile sadece bir kez çalışır

  // useMemo ile bileşen içeriğini önbelleğe alarak gereksiz render'ları engelliyoruz
  const pageContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="max-w-3xl mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Ayarlar</h1>
          <div className="flex items-center justify-center h-40">
            <p className="text-lg text-muted-foreground">Profil bilgileri yükleniyor...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Ayarlar</h1>
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Profil Ayarları</h2>
            <ProfileForm userProfile={userProfile} />
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Dil ve Tema Ayarları</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <LanguageSelector className="flex-1" />
              <ThemeSelector className="flex-1" />
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Kredi Bilgileri</h2>
            <CreditInfo />
          </section>
        </div>
      </div>
    );
  }, [isLoading, userProfile]);

  return pageContent;
} 