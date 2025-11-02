import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Myrecipes } from '../model/myrecipes';

@Injectable({
  providedIn: 'root',
})
export class MyRecipesService {
  private readonly API = 'http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes/receitas.php';
  private httpClient = inject(HttpClient);

  list() {
    return this.httpClient.get<Myrecipes[]>(this.API);
  }
}
