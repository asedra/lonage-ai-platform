'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/app/dashboard/layout'
import { useUserStore, User, initToast } from '@/store/useUserStore'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { UserAddModal } from '@/components/ui/userAddModal'
import { UserEditModal } from '@/components/ui/UserEditModal'
import { useToast } from '@/components/ui/use-toast'

export default function UsersSettingsPage() {
  const router = useRouter()
  const { users, loading, error, fetchUsers, deleteUser } = useUserStore()
  const [isDeleting, setIsDeleting] = useState<number | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const { toast } = useToast()

  // Toast fonksiyonunu store'a ilet
  useEffect(() => {
    initToast(toast)
  }, [toast])

  // Sayfa yüklendiğinde kullanıcıları getir
  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleDeleteUser = async (userId: number) => {
    if (confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) {
      setIsDeleting(userId)
      try {
        await deleteUser(userId)
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditModalOpen(true)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '---'
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Kullanıcılar</h1>
            <p className="text-muted-foreground mt-1">Sistem kullanıcılarını yönetin</p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)}>Yeni Kullanıcı Ekle</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Yönetimi</CardTitle>
            <CardDescription>
              Sistemdeki tüm kullanıcıları görüntüleyin ve yönetin.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {loading && !users.length ? (
              <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Kullanıcılar yükleniyor...</span>
              </div>
            ) : (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]">ID</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Yetki</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Son Giriş</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.id}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                              {user.name.charAt(0)}
                            </div>
                            <span>{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.is_active ? 'default' : 'secondary'}
                            className={user.is_active ? 'bg-green-500' : 'bg-yellow-500'}
                          >
                            {user.is_active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(user.last_login)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditUser(user)}
                            >
                              Düzenle
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={isDeleting === user.id}
                            >
                              {isDeleting === user.id ? (
                                <>
                                  <Loader2 className="h-3 w-3 animate-spin mr-1" />
                                  Siliniyor..
                                </>
                              ) : 'Sil'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {users.length === 0 && !loading && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          Hiç kullanıcı bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Kullanıcı ekleme modalı */}
        <UserAddModal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)} 
        />

        {/* Kullanıcı düzenleme modalı */}
        <UserEditModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      </div>
    </DashboardLayout>
  )
} 