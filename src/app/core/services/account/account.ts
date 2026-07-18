import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class Account {

  private httpClient = inject(HttpClient);
   private readonly baseUrl = environment.baseUrl;

    getProfileData(): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/me/profile`);
    }

     UpdateProfile(account: object): Observable<any> {
      return this.httpClient.put(`${this.baseUrl}/me/profile`, account);
    }
      changePassword(currentPassword: string, newPassword: string): Observable<any> {
      return this.httpClient.post(`${this.baseUrl}/me/change-password`, { currentPassword, newPassword});
    }
}
