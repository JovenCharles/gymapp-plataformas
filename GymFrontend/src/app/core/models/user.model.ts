export type AppRole = 'student' | 'admin';

export interface User {
  id: number;
  rut: string;
  name: string;
  email: string;
  username: string;
  userType: string;
  role: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface RegisterResponse {
  message: string;
  user: User;
}
