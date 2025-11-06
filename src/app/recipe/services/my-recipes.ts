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
  // URL base da API
  private readonly API =
    'http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes';

  private httpClient = inject(HttpClient);

  // Método auxiliar pra evitar repetição
  private url(path: string): string {
    return `${this.API}/${path}`;
  }

  // Lista todas as receitas
  list(): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(this.url('receitas.php'));
  }

  // Lista receitas por categoria (usando id e nome na URL)
  listCat(categoria: { id: number; nome: string }): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(
      this.url(
        `receitas_categoria.php?id=${categoria.id}&nome=${encodeURIComponent(
          categoria.nome
        )}`
      )
    );
  }

  // Lista receitas aleatórias pro slide da home
  listRandom(limit: number): Observable<Slide[]> {
    return this.httpClient.get<Slide[]>(
      this.url(`slide_home.php?limit=${limit}`)
    );
  }

  // Busca receita específica pelo ID
  buscarPorId(id: number): Observable<Receita[]> {
    return this.httpClient.get<Receita[]>(
      this.url(`receitas/buscar.php?id=${id}`)
    );
  }
}
