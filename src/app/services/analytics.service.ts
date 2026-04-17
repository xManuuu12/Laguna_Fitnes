import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ApiResponse } from '../models/api-response.interface';

export interface AnalyticsData {
  estados: {
    activos: number;
    inactivos: number;
  };
  distribucion: Array<{
    nombre: string;
    cantidad: number;
  }>;
  ingresos: Array<{
    nombre: string;
    total: number;
    ventas: number;
  }>;
  visitas: {
    porDiaSemana: { [key: string]: number };
    ultimos7Dias: { [key: string]: number };
    porSemana: { [key: string]: number };
    porMes: { [key: string]: number };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}analytics`;

  getDashboardData(startDate?: string, endDate?: string): Observable<ApiResponse<AnalyticsData>> {
    let params = new HttpParams();
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<ApiResponse<AnalyticsData>>(`${this.apiUrl}/dashboard`, { params });
  }

  exportToExcel(type: string = 'all', startDate?: string, endDate?: string): Observable<Blob> {
    let params = new HttpParams().set('type', type);
    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get(`${this.apiUrl}/export`, {
      params,
      responseType: 'blob'
    });
  }
}
