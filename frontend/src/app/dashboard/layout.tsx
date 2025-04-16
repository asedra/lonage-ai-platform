"use client"

import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { cn } from "@/lib/utils";
import { MessageSquare, Cpu } from "lucide-react"
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '@/components/ui/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  
  // Ayarlar menüsünün açık olup olmadığını kontrol eden state
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false)
  
  // Sayfa değiştiğinde, eğer ayarlar alt sayfasına gidiliyorsa menüyü otomatik aç
  useEffect(() => {
    if (pathname === '/settings' || pathname.startsWith('/settings/')) {
      setIsSettingsMenuOpen(true)
    }
    
    // AI Models sayfasına navigasyon durumunu ayarla
    if (pathname === '/ai-models' || pathname.startsWith('/ai-models/')) {
      // Buraya geldiğimizde ayarlar menüsünü kapat
      setIsSettingsMenuOpen(false)
    }
  }, [pathname])

  // Ayarlar menüsünün aktif olup olmadığını kontrol et
  const isSettingsActive = pathname === '/settings' || pathname.startsWith('/settings/')

  // Ayarlar menüsünü toggle etme fonksiyonu
  const toggleSettingsMenu = () => {
    setIsSettingsMenuOpen(prev => !prev)
  }

  return (
    <SidebarProvider 
      defaultOpen={true}
      style={{
        "--sidebar-width": "260px",
        "--sidebar-width-icon": "60px",
        "--sidebar-width-mobile": "280px",
      } as React.CSSProperties}
    >
      <div className={cn(
        "flex h-screen w-full"
      )}>
        <aside className={cn(
          "w-[260px] border-r bg-sidebar border-sidebar-border"
        )}>
          <Sidebar className="h-full">
            <SidebarHeader className="p-3">
              <h2 className="text-lg font-bold">AI Asistan Platformu</h2>
            </SidebarHeader>
            <SidebarContent className="p-2">
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={pathname === '/dashboard'}
                    onClick={() => router.push('/dashboard')}
                  >
                    Gösterge Paneli
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={pathname.includes('/assistants')}
                    onClick={() => router.push('/dashboard/assistants')}
                  >
                    Asistanlarım
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={pathname === '/chat' || pathname.startsWith('/chat/')}
                    onClick={() => router.push('/chat')}
                  >
                    <MessageSquare className="size-4 mr-1" />
                    <span>Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={pathname === '/ai-models' || pathname.startsWith('/ai-models/')}
                    onClick={() => router.push('/ai-models')}
                  >
                    <Cpu className="size-4 mr-1" />
                    <span>AI Models</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                {/* Ayarlar alt kırılımlı menü */}
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    isActive={isSettingsActive}
                    onClick={toggleSettingsMenu}
                  >
                    Ayarlar
                  </SidebarMenuButton>
                  
                  {isSettingsMenuOpen && (
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === '/settings'}
                          onClick={() => router.push('/settings')}
                        >
                          Genel Ayarlar
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === '/settings/users'}
                          onClick={() => router.push('/settings/users')}
                        >
                          Kullanıcılar
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                          isActive={pathname === '/settings/billing'}
                          onClick={() => router.push('/settings/billing')}
                        >
                          Ödeme Ayarları
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter className="p-3 mt-auto">
              <p className="text-xs text-center text-muted-foreground">
                © 2024 AI Asistan Platformu
              </p>
            </SidebarFooter>
          </Sidebar>
        </aside>
        <main className={cn(
          "flex-1 overflow-auto",
          "w-full bg-background"
        )}>
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
} 