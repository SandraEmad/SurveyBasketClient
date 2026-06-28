import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Service()
export class Account {

  private httpClient = inject(HttpClient);
   private readonly baseUrl = environment.baseUrl;

    getProfileData(): Observable<any> {
      return this.httpClient.get(`${this.baseUrl}/profile-data`);
    }

     UpdateProfile(photo: object): Observable<any> {
      return this.httpClient.put(`${this.baseUrl}/upload-photo`, photo);
    }

      changePassword(password: string, newPassword: string): Observable<any> {
      return this.httpClient.patch(`${this.baseUrl}/change-password`, { password, newPassword,});
    }
}
