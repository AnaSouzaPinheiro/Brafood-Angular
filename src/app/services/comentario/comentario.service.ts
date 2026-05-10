import { Injectable } from '@angular/core';
import { Comentario, CriarComentarioPayload } from '../../model/comentario';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class ComentarioService extends BaseService {
  listarcommentsPorReceita(idReceita: number) {
    return this.httpClient.get<Comentario[]>(
      this.url(`comentarios.php?receita=${idReceita}`),
    );
  }

  criar(payload: CriarComentarioPayload) {
    return this.httpClient.post(this.url('comentarios.php'), payload);
  }
}
