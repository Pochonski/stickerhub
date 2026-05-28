export interface AuthUser {
  id: string;
  email?: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
}

export interface AuthRepository {
  getSession(): Promise<AuthSession | null>;
  getUser(): Promise<AuthUser | null>;
  signInWithOtp(email: string): Promise<void>;
  signInWithPassword(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
