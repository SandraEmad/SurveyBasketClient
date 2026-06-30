import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IUser } from '../../models/users/iuser';

@Service()
export class User {
  private httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getAllUser(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/Users`);
  }

  getUserById(id: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/Users/GetById/${id}`);
  }

  createUser(user: IUser): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/Users`, user);
  }

  updateUser(id: string, user: IUser): Observable<any> {
    return this.httpClient.put<IUser>(`${this.baseUrl}/Users/${id}`, user);
  }

  toggleStatus(id: string, user: IUser): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/Users/${id}/toggle-status`, user);
  }

  unlock(id: string, user: IUser): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/Users/${id}/unlock`,user);
  }

}
