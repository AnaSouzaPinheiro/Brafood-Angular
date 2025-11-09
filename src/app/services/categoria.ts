import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Categoria } from '../model/categoria';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  // URL base (igual ao MyRecipesService)
  private readonly API =
    'http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes';

  private httpClient = inject(HttpClient);

  // Método auxiliar pra montar URLs
  private url(path: string): string {
    return `${this.API}/${path}`;
  }

  // Lista todas as categorias
  listCats(): Observable<Categoria[]> {
    return this.httpClient.get<Categoria[]>(this.url('categorias.php'));
  }

  // Busca uma categoria específica por ID
  getCatById(id: number): Observable<Categoria> {
    return this.httpClient.get<Categoria>(this.url(`categorias.php?id=${id}`));
  }
}
