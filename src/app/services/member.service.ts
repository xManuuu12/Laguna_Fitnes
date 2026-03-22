import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Member } from '../models/member.interface';
import { ApiResponse } from '../models/api-response.interface';

@Injectable({
  providedIn: 'root'
})
export class MemberService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/members';

  getAllMembers(page: number = 1, limit: number = 20): Observable<ApiResponse<Member[]>> {
    return this.http.get<ApiResponse<Member[]>>(`${this.apiUrl}?page=${page}&limit=${limit}`);
  }

  getMemberById(id: number): Observable<ApiResponse<Member>> {
    return this.http.get<ApiResponse<Member>>(`${this.apiUrl}/${id}`);
  }

  createMember(member: Member): Observable<ApiResponse<Member>> {
    return this.http.post<ApiResponse<Member>>(this.apiUrl, member);
  }

  updateMember(id: number, member: Partial<Member>): Observable<ApiResponse<Member>> {
    return this.http.put<ApiResponse<Member>>(`${this.apiUrl}/${id}`, member);
  }

  deleteMember(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/${id}`);
  }
}
