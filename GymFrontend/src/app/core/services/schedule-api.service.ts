import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ScheduleAvailability {
  id: number;
  day: string;
  startTime: string;
  endTime: string;
  zone: string;
  capacity: number;
  reservedCount: number;
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleApiService {
  private readonly apiUrl = '/api/Schedules';

  constructor(private readonly http: HttpClient) {}

  getSchedules(): Observable<ScheduleAvailability[]> {
    return this.http.get<ScheduleAvailability[]>(this.apiUrl);
  }
}
