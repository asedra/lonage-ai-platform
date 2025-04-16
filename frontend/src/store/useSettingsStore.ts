import { create } from 'zustand';

interface Profile {
  name: string;
  surname: string;
  email: string;
  fullName?: string;
}

interface SettingsState {
  language: string;
  profile: Profile;
  updateLanguage: (language: string) => void;
  updateProfile: (profile: Profile) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'Türkçe',
  profile: { name: '', surname: '', email: '', fullName: '' },
  updateLanguage: (language) => set({ language }),
  updateProfile: (profile) => set((state) => {
    if (profile.fullName && !profile.name && !profile.surname) {
      const nameParts = profile.fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return { 
        profile: { 
          ...profile, 
          name: firstName, 
          surname: lastName,
          fullName: profile.fullName 
        } 
      };
    }
    
    if (profile.name || profile.surname) {
      return { 
        profile: { 
          ...profile, 
          fullName: `${profile.name || ''} ${profile.surname || ''}`.trim() 
        } 
      };
    }
    
    return { profile };
  }),
})); 