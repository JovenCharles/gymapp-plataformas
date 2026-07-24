import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CreateReservationRequest {
  day: string;
  startTime: string;
  endTime: string;
  zone: string;
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
  private readonly apiUrl = '/api/Reservations';

  constructor(private readonly http: HttpClient) {}

  getReservations(): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(this.apiUrl);
  }

  getReservationsByUser(userId: number): Observable<Reservation[]> {
    return this.http.get<Reservation[]>(`${this.apiUrl}/user/${userId}`);
  }

  createReservation(data: CreateReservationRequest): Observable<{ message: string; reservation: Reservation }> {
    return this.http.post<{ message: string; reservation: Reservation }>(this.apiUrl, data);
  }

  cancelReservation(id: number): Observable<{ message: string; reservation: Reservation }> {
    return this.http.delete<{ message: string; reservation: Reservation }>(`${this.apiUrl}/${id}`);
  }
}
