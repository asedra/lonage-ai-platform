import { create } from 'zustand';
import { getUsers, deleteUser, createUser, updateUser } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';

let toast: ReturnType<typeof useToast>['toast'];

// Toaster fonksiyonunu dışarıdan alacağız (React hook olduğu için store içinde direkt kullanamayız)
export const initToast = (toastFn: ReturnType<typeof useToast>['toast']) => {
  toast = toastFn;
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login: string | null;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;
  createUser: (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => Promise<User>;
  updateUser: (userId: number, userData: {
    name: string;
    email: string;
    role: string;
  }) => Promise<User>;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  loading: false,
  error: null,
  
  fetchUsers: async () => {
    set({ loading: true, error: null });
    try {
      const users = await getUsers();
      set({ users, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      // Toast bildirimi göster
      if (toast) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: `Kullanıcılar yüklenirken bir sorun oluştu: ${errorMessage}`,
        });
      }
    }
  },
  
  deleteUser: async (userId: number) => {
    set({ loading: true, error: null });
    try {
      await deleteUser(userId);
      set((state) => ({
        users: state.users.filter(user => user.id !== userId),
        loading: false
      }));
      
      // Toast bildirimi göster
      if (toast) {
        toast({
          title: "Başarılı",
          description: "Kullanıcı başarıyla silindi.",
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı silinirken hata oluştu';
      set({ 
        error: errorMessage,
        loading: false 
      });
      
      // Toast bildirimi göster
      if (toast) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: `Kullanıcı silinirken bir sorun oluştu: ${errorMessage}`,
        });
      }
    }
  },
  
  createUser: async (userData) => {
    set({ loading: true, error: null });
    try {
      const newUser = await createUser(userData);
      set((state) => ({
        users: [...state.users, newUser],
        loading: false
      }));
      
      // Toast bildirimi göster
      if (toast) {
        toast({
          title: "Başarılı",
          description: "Yeni kullanıcı başarıyla oluşturuldu.",
        });
      }
      
      return newUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı oluşturulurken hata oluştu';
      set({ 
        error: errorMessage,
        loading: false
      });
      
      // Toast bildirimi göster
      if (toast) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: `Kullanıcı oluşturulurken bir sorun oluştu: ${errorMessage}`,
        });
      }
      
      throw error;
    }
  },
  
  updateUser: async (userId, userData) => {
    set({ loading: true, error: null });
    try {
      const updatedUser = await updateUser(userId, userData);
      set((state) => ({
        users: state.users.map(user => 
          user.id === userId ? { ...user, ...updatedUser } : user
        ),
        loading: false
      }));
      
      // Toast bildirimi göster
      if (toast) {
        toast({
          title: "Başarılı",
          description: "Kullanıcı bilgileri başarıyla güncellendi.",
        });
      }
      
      return updatedUser;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Kullanıcı güncellenirken hata oluştu';
      set({ 
        error: errorMessage,
        loading: false
      });
      
      // Toast bildirimi göster
      if (toast) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: `Kullanıcı güncellenirken bir sorun oluştu: ${errorMessage}`,
        });
      }
      
      throw error;
    }
  }
})); 