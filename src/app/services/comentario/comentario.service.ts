import { Injectable } from '@angular/core';
import { Comentario, CriarComentarioPayload } from '../../model/comentario';
import { BaseService } from '../base/base.service';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../model/api-response';

@Injectable({
  providedIn: 'root',
})
export class ComentarioService extends BaseService {
  listarcommentsPorReceita(idReceita: number): Observable<Comentario[]> {
    return this.httpClient.get<Comentario[]>(
      this.url(`comentarios.php?receita=${idReceita}`),
    );
  }

  criar(payload: CriarComentarioPayload): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(
      this.url('comentarios.php'),
      payload,
    );
  }
}
