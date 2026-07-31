import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthResponse, RegisterResponse, User } from '../models/user.model';

export interface LoginRequest {
  rut: string;
  password: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  rut: string;
  name: string;
  email: string;
  password: string;
  userType: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly apiUrl = '/api/Auth';

  constructor(private readonly http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data);
  }

  adminLogin(data: AdminLoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/admin-login`, data);
  }

  register(data: RegisterRequest): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, data);
  }

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/users`);
  }

  setUserStatus(id: number, enabled: boolean): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(`${this.apiUrl}/users/${id}/status`, { enabled });
  }
}
