import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Visit } from '../models/visit.interface';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class VisitService {
  private http = inject(HttpClient);
  // Asegúrate de que este puerto coincida con tu backend FitManagerBackend
  private apiUrl = 'http://localhost:5000/api/visitas'; 

  /**
   * Obtener todas las visitas (Historial)
   */
  getAllVisits(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(this.apiUrl);
  }

  /**
   * Registrar una nueva visita por ID de socio
   * @param id_socio ID o código del miembro
   */
  registerVisit(id_socio: number): Observable<ApiResponse<any>> {
    const payload = {
      id_miembro: id_socio,
      fecha: new Date().toISOString().split('T')[0],
      hora_entrada: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
    };
    return this.http.post<ApiResponse<any>>(this.apiUrl, payload);
  }

  /**
   * Obtener estadísticas rápidas del día
   */
  getTodayStats(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats/today`);
  }

  /**
   * Verificar estado de membresía antes de entrar
   */
  checkMemberStatus(id_socio: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/check-status/${id_socio}`);
  }
}
