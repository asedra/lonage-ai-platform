// API işlemleri için yardımcı fonksiyonlar

// Kullanıcıları getir
export const getUsers = async () => {
  try {
    const response = await fetch('/api/users');
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Kullanıcılar getirilirken hata oluştu');
    }
    return await response.json();
  } catch (error) {
    console.error('Kullanıcılar getirilirken hata:', error);
    throw error;
  }
};

// Kullanıcı sil
export const deleteUser = async (userId: number) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Kullanıcı silinirken hata oluştu');
    }
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı silinirken hata:', error);
    throw error;
  }
};

// Yeni kullanıcı oluştur
export const createUser = async (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
}) => {
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Kullanıcı oluşturulurken hata oluştu');
    }
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı oluşturulurken hata:', error);
    throw error;
  }
};

// Kullanıcı güncelle
export const updateUser = async (userId: number, userData: {
  name: string;
  email: string;
  role: string;
}) => {
  try {
    const response = await fetch(`/api/users/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Kullanıcı güncellenirken hata oluştu');
    }
    return await response.json();
  } catch (error) {
    console.error('Kullanıcı güncellenirken hata:', error);
    throw error;
  }
}; 