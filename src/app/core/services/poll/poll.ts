import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { IPoll } from '../../models/polls/Ipoll';

@Service()
export class Poll {
  private httpClient = inject(HttpClient);
  private readonly baseUrl = environment.baseUrl;

  getAllPoll(): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/GetList`);
  }

  getPollById(id: number): Observable<any> {
    return this.httpClient.get(`${this.baseUrl}/GetById`, { params: { id } });
  }

  createPoll(poll: IPoll): Observable<any> {
    return this.httpClient.post(`${this.baseUrl}/Create`, poll);
  }

  updatePoll(id: number, poll: IPoll): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/Update`, poll, { params: { id } });
  }

  deletePoll(id: number): Observable<any> {
    return this.httpClient.delete(`${this.baseUrl}/Delete`, { params: { id } });
  }

  togglePublishStatus(id: number): Observable<any> {
    return this.httpClient.put(`${this.baseUrl}/${id}/TogglePublishStatus`, {});
  }
}
