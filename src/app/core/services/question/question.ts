import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';

@Service()
export class Question {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/api/Question`;

getAllQuestion(pollId: number, body: any): Observable<any> {
  return this.httpClient.request('GET', this.baseUrl, {
    params: { pollId },
    body
  });
}

  getById(pollId: number, id: number): Observable<any> {
    const params = new HttpParams().set('pollId', pollId).set('id', id);
    return this.httpClient.get(`${this.baseUrl}/GetByPollId`, { params });
  }

  createQuestion(pollId: number, question: any): Observable<any> {
    const params = new HttpParams().set('pollId', pollId);
    return this.httpClient.post(this.baseUrl, question, { params });
  }

  updateQuestion(pollId: number, id: number, payload: any): Observable<any> {
    const params = new HttpParams().set('pollId', pollId).set('id', id);
    return this.httpClient.put(`${this.baseUrl}/Update`, payload, { params });
  }

  toggleStatus(pollId: number, id: number): Observable<any> {
    const params = new HttpParams().set('pollId', pollId).set('id', id);
    return this.httpClient.put(`${this.baseUrl}/ToggleStatus`, {}, { params });
  }
}
