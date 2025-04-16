import { create } from 'zustand';

interface Profile {
  name: string;
  surname: string;
  email: string;
}

interface SettingsState {
  language: string;
  profile: Profile;
  updateLanguage: (language: string) => void;
  updateProfile: (profile: Profile) => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  language: 'Türkçe',
  profile: { name: '', surname: '', email: '' },
  updateLanguage: (language) => set({ language }),
  updateProfile: (profile) => set({ profile }),
})); 