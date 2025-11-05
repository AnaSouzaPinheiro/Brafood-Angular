import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipes } from '../model/myrecipes';
import { Slide } from '../model/slide';
import { Receita } from '../model/receita';

@Injectable({
  providedIn: 'root',
})
export class MyRecipesService {
  private readonly API =
    'http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes/receitas.php';
  private httpClient = inject(HttpClient);

  list(): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(this.API);
  }

  listRandom(limit: number): Observable<Slide[]> {
    return this.httpClient.get<Slide[]>(
      `http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes/slide_home.php?limit=${limit}`
    );
  }

  buscarPorId(id: number) {
    return this.httpClient.get<Receita[]>(
      `http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes/receitas/buscar.php?id=${id}`
    );
  }
}
