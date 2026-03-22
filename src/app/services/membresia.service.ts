import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Membresia } from '../models/membresia.interface';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class MembresiaService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/membresias';

  getAllMembresias(): Observable<ApiResponse<Membresia[]>> {
    return this.http.get<ApiResponse<Membresia[]>>(this.apiUrl);
  }

  createMembresia(membresia: Membresia): Observable<ApiResponse<Membresia>> {
    return this.http.post<ApiResponse<Membresia>>(this.apiUrl, membresia);
  }

  updateMembresia(id: number, membresia: Partial<Membresia>): Observable<ApiResponse<Membresia>> {
    return this.http.put<ApiResponse<Membresia>>(`${this.apiUrl}/${id}`, membresia);
  }

  deleteMembresia(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
