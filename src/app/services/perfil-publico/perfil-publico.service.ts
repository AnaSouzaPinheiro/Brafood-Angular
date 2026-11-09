import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';

export interface PerfilPublico {
  usuario: {
    id:          number;
    nome:        string;
    apelido:     string;
    bio:         string | null;
    foto_perfil: string | null;
  };
  total_receitas:  number;
  total_favoritos: number;
  receitas:        any[];
}

@Injectable({ providedIn: 'root' })
export class PerfilPublicoService extends BaseService {

  /** Busca pelo apelido; um número (link antigo /chef/5) busca pelo id */
  buscar(apelidoOuId: string): Observable<PerfilPublico> {
    const param = /^\d+$/.test(apelidoOuId)
      ? `id=${apelidoOuId}`
      : `apelido=${encodeURIComponent(apelidoOuId)}`;
    return this.httpClient.get<PerfilPublico>(this.url(`perfil_publico.php?${param}`));
  }
}
