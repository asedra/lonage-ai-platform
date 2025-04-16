'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

export default function HomePage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">LonAge Platform</h1>
            </div>
            <div className="flex items-center">
              {user ? (
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="text-sm"
                >
                  Dashboard
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/login')}
                  className="text-sm"
                >
                  Giriş Yap
                </Button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            AI Asistanlarınızı Keşfedin
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Özel AI asistanlarınızı oluşturun ve yönetin.
          </p>
          <div className="mt-8">
            <Button
              onClick={() => router.push('/login')}
              className="text-lg px-8 py-6"
            >
              Hemen Başlayın
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
