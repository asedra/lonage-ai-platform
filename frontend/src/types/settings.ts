export interface Profile {
  name: string;
  surname: string;
  email: string;
}

export interface Settings {
  language: string;
  profile: Profile;
} 