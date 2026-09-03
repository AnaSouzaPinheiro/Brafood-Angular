import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../model/api-response';
import { Comentario, CriarComentarioPayload } from '../../model/comentario';
import { BaseService } from '../base/base.service';

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

  // Autorização é validada no backend via token (Authorization: Bearer),
  // que o authInterceptor já anexa automaticamente — não precisa mandar
  // id_usuario aqui, e nem deveria: o cliente não pode ser a fonte da
  // verdade de quem está autorizado a apagar o quê.
  deletar(idComentario: number): Observable<ApiResponse> {
    return this.httpClient.delete<ApiResponse>(
      this.url(`comentarios.php?id=${idComentario}`),
    );
  }
}
