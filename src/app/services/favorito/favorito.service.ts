import { Injectable } from '@angular/core';
import { BaseService } from '../base/base.service';
import { Observable } from 'rxjs';
import { Recipes } from '../../model/myrecipes';
import { ApiResponse } from '../../model/api-response';

@Injectable({
  providedIn: 'root',
})
export class FavoritoService extends BaseService {
  // LISTAR favoritos do usuário
  listarFavoritos(userId: number): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(
      this.url(`favorito.php?idUser=${userId}`),
    );
  }

  // VERIFICAR se receita é favorita
  isFavorita(userId: number, receitaId: number) {
    return this.httpClient.get<{ favorite: boolean }>(
      this.url(`favorito.php?check=1&idUser=${userId}&idReceita=${receitaId}`),
    );
  }

  // FAVORITAR — método POST
  favoritar(userId: number, receitaId: number): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(this.url('favorito.php'), {
      idUser: userId,
      idReceita: receitaId,
    });
  }

  // DESFAVORITAR — método DELETE
  desfavoritar(userId: number, receitaId: number): Observable<ApiResponse> {
    return this.httpClient.request<ApiResponse>(
      'DELETE',
      this.url('favorito.php'),
      {
        body: { idUser: userId, idReceita: receitaId },
      },
    );
  }
}
