import { inject, Service } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';


@Service()
export class Question {
  private readonly httpClient = inject(HttpClient);
  private readonly baseUrl = `${environment.baseUrl}/Question`;

  getAllQuestion(pollId: number, pageNumber = 1, pageSize = 10): Observable<any> {
    const params = new HttpParams()
      .set('pollId', pollId)
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);
    return this.httpClient.get(`${this.baseUrl}/GetByPollId`, { params });
  }

  getById(pollId: number, id: number): Observable<any> {
    const params = new HttpParams().set('pollId', pollId).set('id', id);
    return this.httpClient.get(`${this.baseUrl}/GetByPollId`, { params });
  }

  createQuestion(pollId: number, payload: { content: string; answers: string[] }): Observable<any> {
    const params = new HttpParams().set('pollId', pollId);
    return this.httpClient.post(this.baseUrl, payload, { params });
  }

  updateQuestion(pollId: number, id: number, payload: { content: string; answers: string[] }): Observable<any> {
    const params = new HttpParams().set('pollId', pollId).set('id', id);
    return this.httpClient.put(`${this.baseUrl}/Update`, payload, { params });
  }

  toggleStatus(pollId: number, id: number): Observable<any> {
    const params = new HttpParams().set('pollId', pollId).set('id', id);
    return this.httpClient.put(`${this.baseUrl}/ToggleStatus`, {}, { params });
  }

  deleteQuestion(pollId: number, id: number): Observable<any> {
    const params = new HttpParams().set('pollId', pollId).set('id', id);
    return this.httpClient.delete(this.baseUrl, { params });
  }
}
