import { create } from 'zustand'

interface User {
  id: number
  name: string
  email: string
  is_active?: boolean
}

interface LoginData {
  email: string
  password: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUser: (updatedUser: Partial<User>) => void
  login: (data: LoginData) => Promise<User>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  error: null,
  setUser: (user: User | null) => set({ user }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
  
  updateUser: (updatedUser: Partial<User>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    
    // Güncel kullanıcı bilgilerini oluştur
    const newUser = { ...currentUser, ...updatedUser };
    
    // Store'u güncelle
    set({ user: newUser });
    
    // LocalStorage'daki kullanıcı bilgilerini güncelle
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        localStorage.setItem('user', JSON.stringify({ ...parsedUser, ...updatedUser }));
      } catch (e) {
        console.error("LocalStorage'daki kullanıcı bilgileri güncellenirken hata:", e);
      }
    }
  },
  
  login: async (data: LoginData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(responseData.detail || 'Giriş yapılamadı');
      }

      // Kullanıcı bilgilerini kaydet
      localStorage.setItem('user', JSON.stringify(responseData.user));
      localStorage.setItem('token', responseData.access_token);
      
      set({ 
        user: responseData.user,
        isLoading: false 
      });
      
      return responseData.user;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu';
      set({ 
        error: errorMessage,
        isLoading: false 
      });
      throw error;
    }
  },
  
  logout: async () => {
    try {
      set({ isLoading: true, error: null });
      // API çağrısı burada yapılacak
      await fetch('/api/auth/logout', { method: 'POST' });
      
      // LocalStorage'dan kullanıcı bilgilerini temizle
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      set({ user: null, isLoading: false });
    } catch (error) {
      set({ error: 'Çıkış yapılırken bir hata oluştu', isLoading: false });
    }
  },
})) 