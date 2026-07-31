import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MyQrCode {
  rut: string;
  name: string;
  date: string;
  token: string;
  validFrom: string;
  validUntil: string;
}

@Injectable({
  providedIn: 'root',
})
export class QrApiService {
  private readonly apiUrl = '/api/Qr';

  constructor(private readonly http: HttpClient) {}

  getMyCode(): Observable<MyQrCode> {
    return this.http.get<MyQrCode>(`${this.apiUrl}/my-code`);
  }
}
