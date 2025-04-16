import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { Label } from './label'
import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { useUserStore, User } from '@/store/useUserStore'
import { useAuthStore } from '@/store/useAuthStore'
import { Loader2 } from 'lucide-react'

interface UserEditModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export function UserEditModal({ isOpen, onClose, user }: UserEditModalProps) {
  const { updateUser, loading } = useUserStore()
  const { user: currentUser, updateUser: updateAuthUser } = useAuthStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ''
  })
  
  // User değiştiğinde form verilerini güncelle
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role
      })
    }
  }, [user])
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    
    try {
      // Kullanıcıyı güncelle
      const updatedUser = await updateUser(user.id, formData)
      
      // Eğer güncellenen kullanıcı mevcut giriş yapan kullanıcı ise, auth store'u da güncelle
      if (currentUser && currentUser.id === user.id) {
        updateAuthUser({ 
          name: formData.name,
          email: formData.email
        })
      }
      
      onClose()
    } catch (error) {
      console.error('Kullanıcı güncellenirken hata:', error)
    }
  }
  
  // Modal kapanırken form verilerini sıfırlama
  const handleModalClose = () => {
    // Modal kapanırken reset işlemi yapmıyoruz çünkü useEffect ile dolduruyoruz
    onClose()
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={handleModalClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Kullanıcı Düzenle</DialogTitle>
          <DialogDescription>
            Kullanıcı bilgilerini güncelleyin.
          </DialogDescription>
        </DialogHeader>
        
        {user && (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Ad Soyad</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Kullanıcının adı ve soyadı"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="ornek@email.com"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="role">Yetki</Label>
              <Select 
                value={formData.role} 
                onValueChange={handleRoleChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kullanıcı yetkisi seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Yönetici">Yönetici</SelectItem>
                  <SelectItem value="Editör">Editör</SelectItem>
                  <SelectItem value="Kullanıcı">Kullanıcı</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleModalClose}
                disabled={loading}
              >
                İptal
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Güncelleniyor...
                  </>
                ) : 'Kaydet'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
} 