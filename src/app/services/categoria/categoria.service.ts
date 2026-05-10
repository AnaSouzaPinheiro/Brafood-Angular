import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { Categoria } from '../../model/categoria';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService extends BaseService{
  // Lista todas as categorias
  listCats(): Observable<Categoria[]> {
    return this.httpClient.get<Categoria[]>(this.url('categorias.php'));
  }

  // Busca uma categoria específica por ID
  getCatById(id: number): Observable<Categoria> {
    return this.httpClient.get<Categoria>(this.url(`categorias.php?id=${id}`));
  }
}
