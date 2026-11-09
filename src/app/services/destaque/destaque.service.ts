import { Injectable } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';

export interface ReceitaDestaque {
  id:               number;
  titulo:           string;
  resumo:           string | null;
  imagem1:          string | null;
  qtd_fav:          number;
  media_avaliacao:  number | null;
  qtd_avaliacoes:   number;
  destaque_desde:   string | null;
  autor:            string | null;
  categoria:        string | null;
  subcategoria:     string | null;
  /** true quando o admin escolheu esta receita para a semana */
  manual?:          boolean;
}

@Injectable({ providedIn: 'root' })
export class DestaqueService extends BaseService {

  private headers(userId: number): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': String(userId) });
  }

  /** Retorna a receita em destaque (público) */
  buscar(): Observable<ReceitaDestaque> {
    return this.httpClient.get<ReceitaDestaque>(
      this.url('receita_destaque.php')
    );
  }

  /** Busca receitas para o seletor do admin */
  buscarReceitas(termo: string): Observable<any[]> {
    return this.httpClient.get<any[]>(
      this.url(`receita_destaque.php?busca=${encodeURIComponent(termo)}`)
    );
  }

  /** Ativa destaque de uma receita (admin) */
  ativar(idReceita: number, userId: number): Observable<any> {
    return this.httpClient.post(
      this.url('receita_destaque.php'),
      { id_receita: idReceita },
      { headers: this.headers(userId) }
    );
  }

  /** Remove destaque (admin) */
  remover(userId: number): Observable<any> {
    return this.httpClient.delete(
      this.url('receita_destaque.php'),
      { headers: this.headers(userId) }
    );
  }
}
