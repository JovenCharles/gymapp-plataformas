import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Attendance {
  id: number;
  userId: number;
  rut: string;
  userName: string;
  date: string;
  entryTime: string | null;
  entryAdminRut: string | null;
  exitTime: string | null;
  exitAdminRut: string | null;
  reservationId: number | null;
  checkedIn: boolean;
}

export interface AttendanceActionResponse {
  message: string;
  attendance: Attendance;
}

@Injectable({
  providedIn: 'root',
})
export class AttendanceApiService {
  private readonly apiUrl = '/api/Attendance';

  constructor(private readonly http: HttpClient) {}

  registerEntry(token: string): Observable<AttendanceActionResponse> {
    return this.http.post<AttendanceActionResponse>(`${this.apiUrl}/entry`, { token });
  }

  registerExit(token: string): Observable<AttendanceActionResponse> {
    return this.http.post<AttendanceActionResponse>(`${this.apiUrl}/exit`, { token });
  }
}
