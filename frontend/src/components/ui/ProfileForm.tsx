import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useSettingsStore } from "@/store/useSettingsStore"
import { useAuthStore } from "@/store/useAuthStore"
import { useState, useEffect, useRef, memo } from "react"
import { useToast } from "@/components/ui/use-toast"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

// Form şeması Zod ile tanımlanıyor
const profileFormSchema = z.object({
  fullName: z.string().min(3, {
    message: "Ad Soyad en az 3 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileFormProps {
  className?: string;
  userProfile?: {
    name: string;
    surname: string;
    email: string;
  };
}

const ProfileFormComponent = ({ className, userProfile }: ProfileFormProps) => {
  const { profile, updateProfile } = useSettingsStore()
  const { user, updateUser } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const hasFormBeenInitialized = useRef(false)
  
  // Form için varsayılan değerler - önce giriş yapmış kullanıcı bilgisini kontrol et, sonra prop'tan veya store'dan al
  const getFullName = () => {
    if (user?.name) {
      return user.name.trim();
    } else if (userProfile) {
      return `${userProfile.name || ''} ${userProfile.surname || ''}`.trim();
    } else {
      return profile?.fullName || `${profile?.name || ''} ${profile?.surname || ''}`.trim();
    }
  };
  
  const getEmail = () => {
    return user?.email || userProfile?.email || profile?.email || '';
  };
    
  const defaultValues: Partial<ProfileFormValues> = {
    fullName: getFullName(),
    email: getEmail(),
  }

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
  })
  
  // Auth store'daki kullanıcı bilgisi değiştiğinde form değerlerini güncelle
  useEffect(() => {
    if (user?.name && user?.email) {
      form.setValue('fullName', user.name, { shouldValidate: false, shouldDirty: false });
      form.setValue('email', user.email, { shouldValidate: false, shouldDirty: false });
    }
  }, [user, form]);
  
  // userProfile değiştiğinde ve form ilk kez başlatıldığında form değerlerini güncelle
  useEffect(() => {
    // Eğer form başlatıldıysa tekrar çalışmasını önle
    if (hasFormBeenInitialized.current) {
      return;
    }
    
    if (userProfile && userProfile.email) {
      // İsim ve soyisim birleştirme
      const fullName = `${userProfile.name || ''} ${userProfile.surname || ''}`.trim();
      
      // Form değerlerini güncelle
      form.setValue('fullName', fullName, { shouldValidate: false, shouldDirty: false });
      form.setValue('email', userProfile.email, { shouldValidate: false, shouldDirty: false });
      
      // Bir daha bu effect'in çalışmasını engelle
      hasFormBeenInitialized.current = true;
    }
  }, [userProfile, form]);

  async function onSubmit(data: ProfileFormValues) {
    if (!user) {
      toast({
        title: "Hata",
        description: "Kullanıcı girişi yapılmamış!",
        variant: "destructive"
      })
      return
    }

    setIsSubmitting(true)
    try {
      // API çağrısı yapılıyor
      const response = await fetch(`/api/users/${user.id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.fullName, // Backend tek bir name alanı bekliyor
          email: data.email,
          role: "Kullanıcı" // Varsayılan role
        }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        
        // Zustand store'u güncelle - fullName alanı da ekliyoruz
        updateProfile({
          name: data.fullName.split(' ')[0] || '',
          surname: data.fullName.split(' ').slice(1).join(' ') || '',
          email: data.email,
          fullName: data.fullName
        })
        
        // AuthStore'u güncelle - yeni updateUser fonksiyonu ile
        updateUser({
          name: updatedUser.name,
          email: updatedUser.email
        })
        
        toast({
          title: "Başarılı",
          description: "Profil bilgileriniz güncellendi",
        })
      } else {
        const errorData = await response.json()
        toast({
          title: "Güncelleme Başarısız",
          description: errorData.detail || "Profil güncellenirken bir hata oluştu",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bir bağlantı hatası oluştu",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>Profil Bilgileri</CardTitle>
        <CardDescription>
          Kişisel bilgilerinizi buradan güncelleyebilirsiniz.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad Soyad</FormLabel>
                  <FormControl>
                    <Input placeholder="Adınız ve Soyadınız" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input placeholder="E-posta adresinizi giriniz" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <CardFooter className="px-0 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Güncelleniyor..." : "Profili Güncelle"}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

// Gereksiz render'ları önlemek için memo kullan
export const ProfileForm = memo(ProfileFormComponent) 