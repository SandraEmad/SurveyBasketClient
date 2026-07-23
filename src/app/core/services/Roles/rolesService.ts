import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { IRole } from '../../models/Roles/irole';

@Service()
export class RolesService {
  private httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;
  GetAllRoles(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Roles/GetAll?includeDisabled=true`);
  }
  GetPermissionsForRole(id: string): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/api/Roles/GetDetailById/${id}`);
  }
  //https://survey1-basket.runasp.net/api/Roles/CreateRole post
  CreateRole(role: IRole): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/api/Roles/CreateRole`, role);
  }
  //https://survey1-basket.runasp.net/api/Roles/UpdateRole/dc9516ff-29b5-4aeb-bb06-e2292207ff03 put
  UpdateRole(id: string, role: IRole): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/api/Roles/UpdateRole/${id}`, role);
  }
  //https://survey1-basket.runasp.net/api/Roles/ToggleRole/dc9516ff-29b5-4aeb-bb06-e2292207ff03 put

  ToggleRole(id: string): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/api/Roles/ToggleRole/${id}`, {});
  }
}
