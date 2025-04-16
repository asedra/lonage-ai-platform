"use client"

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/useAuthStore'
import DashboardLayout from '../dashboard/layout'
import { ChatWrapper } from '@/components/chat/ChatWrapper'
import { ChatMessageProps } from '@/components/chat/ChatMessage'

export default function ChatPage() {
  const router = useRouter()
  const { user } = useAuthStore()

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
    if (userData && !user) {
      const parsedUser = JSON.parse(userData);
      useAuthStore.setState({ user: parsedUser });
    }
  }, [user, router])

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
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <h1 className="mb-8 text-3xl font-bold">AI Asistan ile Sohbet</h1>
        
        <ChatWrapper 
          initialMessages={[]}
          headerTitle="AI Asistan"
          headerDescription="Seçtiğiniz AI modeli ile sohbet edin"
          headerIcon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          }
        />
      </div>
    </DashboardLayout>
  )
} 