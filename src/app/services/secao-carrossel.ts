import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Section } from '../model/section-home';

@Injectable({
  providedIn: 'root'
})
export class SecaoCarrosselService {

  private apiUrl = 'http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes/secoes_carrossel.php';

  constructor(private http: HttpClient) { }

  getSecoes(): Observable<Section[]> {
    return this.http.get<Section[]>(this.apiUrl);
  }
}
