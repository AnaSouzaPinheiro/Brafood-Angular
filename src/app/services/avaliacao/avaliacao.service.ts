import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';

export interface AvaliacaoResponse {
  nota: number | null;
  media: number | null;
  total: number;
}

export interface AvaliacaoResult {
  success: boolean;
  media: number;
  total: number;
}

@Injectable({ providedIn: 'root' })
export class AvaliacaoService extends BaseService {
  buscar(idUsuario: number, idReceita: number): Observable<AvaliacaoResponse> {
    return this.httpClient.get<AvaliacaoResponse>(
      this.url(`avaliacao.php?id_usuario=${idUsuario}&id_receita=${idReceita}`),
    );
  }

  /** BUGFIX: endpoint público para não-logados (sem id_usuario) */
  buscarPublico(
    idReceita: number,
  ): Observable<Pick<AvaliacaoResponse, 'media' | 'total'>> {
    return this.httpClient.get<Pick<AvaliacaoResponse, 'media' | 'total'>>(
      this.url(`avaliacao.php?id_receita=${idReceita}`),
    );
  }

  avaliar(
    idUsuario: number,
    idReceita: number,
    nota: number,
  ): Observable<AvaliacaoResult> {
    return this.httpClient.post<AvaliacaoResult>(this.url('avaliacao.php'), {
      id_usuario: idUsuario,
      id_receita: idReceita,
      nota,
    });
  }

  remover(idUsuario: number, idReceita: number): Observable<AvaliacaoResult> {
    return this.httpClient.delete<AvaliacaoResult>(
      this.url(`avaliacao.php?id_usuario=${idUsuario}&id_receita=${idReceita}`),
    );
  }
}
