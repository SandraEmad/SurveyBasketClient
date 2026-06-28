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
    return this.httpClient.get(this.baseUrl);
  }

  getUserById(id: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/GetById/${id}`);
  }

  createUser(user: IUser): Observable<any> {
    return this.httpClient.post(this.baseUrl, user);
  }

  updateUser(id: string, user: IUser): Observable<IUser> {
    return this.httpClient.put<IUser>(`${this.baseUrl}/${id}`, user);
  }

  toggleStatus(id: string): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/${id}/toggle-status`, {});
  }

  unlock(id: string): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/${id}/unlock`, {});
  }

}
