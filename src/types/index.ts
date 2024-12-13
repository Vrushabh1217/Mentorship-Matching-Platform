export interface Profile {
  role: string;
  name: string;
  bio: string;
  skills: string;
  interests: string;
}

export interface ProfileWithId extends Profile {
  id: number;
}

export interface AuthResponse {
  token: string;
}

export interface ApiError {
  error: string;
}