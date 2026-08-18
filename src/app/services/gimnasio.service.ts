import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Gimnasio } from '../models/gimnasio.interface';
import { ApiResponse } from '../models/api-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GimnasioService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}gimnasio`;

  getGimnasio(): Observable<ApiResponse<Gimnasio>> {
    return this.http.get<ApiResponse<Gimnasio>>(this.apiUrl);
  }

  updateGimnasio(data: Partial<Gimnasio>): Observable<ApiResponse<Gimnasio>> {
    return this.http.put<ApiResponse<Gimnasio>>(this.apiUrl, data);
  }
}
