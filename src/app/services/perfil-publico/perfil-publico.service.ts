import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';

export interface PerfilPublico {
  usuario: {
    id:          number;
    nome:        string;
    sobrenome:   string;
    apelido:     string | null;
    bio:         string | null;
    foto_perfil: string | null;
  };
  total_receitas:  number;
  total_favoritos: number;
  receitas:        any[];
}

@Injectable({ providedIn: 'root' })
export class PerfilPublicoService extends BaseService {

  buscar(id: number): Observable<PerfilPublico> {
    return this.httpClient.get<PerfilPublico>(
      this.url(`perfil_publico.php?id=${id}`)
    );
  }
}
