import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../models/payment.interface';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);
  private apiUrl = 'https://fit-manager-backend.vercel.app/api/payments';

  getAllPayments(page: number = 1, limit: number = 10): Observable<ApiResponse<Payment[]>> {
    return this.http.get<ApiResponse<Payment[]>>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getAlerts(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/alerts`);
  }

  createPayment(payment: Payment): Observable<ApiResponse<Payment>> {
    return this.http.post<ApiResponse<Payment>>(this.apiUrl, payment);
  }

  createStripeIntent(data: { id_miembro: number, id_membresia: number, monto: number }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/create-intent`, data);
  }
}
