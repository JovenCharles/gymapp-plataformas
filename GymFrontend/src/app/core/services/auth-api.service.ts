import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface LoginRequest {
  rut: string;
  email: string;
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
  private readonly apiUrl = 'http://localhost:5008/api/Auth';

  constructor(private readonly http: HttpClient) {}

  login(data: LoginRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, data);
  }

  register(data: RegisterRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }
}