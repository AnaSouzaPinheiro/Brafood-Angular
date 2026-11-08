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

  // DESFAVORITAR VÁRIAS — seleção em massa (também saem dos quadros)
  desfavoritarVarias(receitaIds: number[]): Observable<ApiResponse> {
    return this.httpClient.request<ApiResponse>('DELETE', this.url('favorito.php'), {
      body: { idsReceitas: receitaIds },
    });
  }

  // STATUS ("quero fazer" / "já fiz") e/ou NOTA pessoal — método PUT.
  // Só os campos enviados mudam. Se a receita não estiver salva, o
  // backend favorita antes (resposta traz favoritou: true).
  atualizarExtras(
    receitaId: number,
    campos: { status?: 'quero_fazer' | 'ja_fiz' | null; nota?: string | null },
  ): Observable<ApiResponse & { favoritou?: boolean }> {
    return this.httpClient.put<ApiResponse & { favoritou?: boolean }>(
      this.url('favorito.php'),
      { idReceita: receitaId, ...campos },
    );
  }
}
