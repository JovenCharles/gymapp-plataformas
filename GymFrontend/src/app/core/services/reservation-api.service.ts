import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateReservationRequest {
  userId: number;
  day: string;
  startTime: string;
  endTime: string;
  zone: string;
  capacity: number;
}

export interface Reservation {
  id: number;
  userId: number;
  userName: string;
  day: string;
  startTime: string;
  endTime: string;
  zone: string;
  capacity: number;
  status: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReservationApiService {
  private readonly apiUrl = 'http://localhost:5008/api/Reservations';

  constructor(private readonly http: HttpClient) {}

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getReservationsByUser(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  createReservation(data: CreateReservationRequest): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  cancelReservation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}