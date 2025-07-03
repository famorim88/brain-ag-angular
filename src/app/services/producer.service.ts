// src/app/services/producer.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ProducerCreate, ProducerUpdate, ProducerResponse, CultureCreate, CultureResponse } from '../models/producer.model';
import { environment } from '../../environments/environment'; // Import environment

@Injectable({
  providedIn: 'root'
})
export class ProducerService {
  private apiUrl = environment.apiUrl; // Get API URL from environment

  constructor(private http: HttpClient) { }

  getProducers(): Observable<ProducerResponse[]> {
    return this.http.get<ProducerResponse[]>(`${this.apiUrl}/producers/`);
  }

  getProducerById(id: number): Observable<ProducerResponse> {
    return this.http.get<ProducerResponse>(`${this.apiUrl}/producers/${id}`);
  }

  createProducer(producer: ProducerCreate): Observable<ProducerResponse> {
    return this.http.post<ProducerResponse>(`${this.apiUrl}/producers/`, producer);
  }

  updateProducer(id: number, producer: ProducerUpdate): Observable<ProducerResponse> {
    return this.http.put<ProducerResponse>(`${this.apiUrl}/producers/${id}`, producer);
  }

  deleteProducer(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/producers/${id}`);
  }

  addCultureToProducer(producerId: number, culture: CultureCreate): Observable<CultureResponse> {
    return this.http.post<CultureResponse>(`${this.apiUrl}/producers/${producerId}/cultures/`, culture);
  }

  deleteCultureFromProducer(producerId: number, cultureId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/producers/${producerId}/cultures/${cultureId}`);
  }
}