import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './dialog'
import { Button } from './button'
import { Label } from './label'
import { Input } from './input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { useUserStore } from '@/store/useUserStore'
import { Loader2 } from 'lucide-react'

interface UserAddModalProps {
  isOpen: boolean
  onClose: () => void
}

export function UserAddModal({ isOpen, onClose }: UserAddModalProps) {
  const { createUser, loading } = useUserStore()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Kullanıcı'
  })
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleRoleChange = (value: string) => {
    setFormData(prev => ({ ...prev, role: value }))
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await createUser(formData)
      onClose()
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'Kullanıcı'
      })
    } catch (error) {
      console.error('Kullanıcı eklenirken hata:', error)
    }
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Yeni Kullanıcı</DialogTitle>
          <DialogDescription>
            Sisteme yeni bir kullanıcı ekleyin.
          </DialogDescription>
        </DialogHeader>
        
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
            <Label htmlFor="password">Şifre</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="******"
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
              onClick={onClose}
              disabled={loading}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : 'Kullanıcı Ekle'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
} 