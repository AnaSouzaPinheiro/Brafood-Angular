import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { HttpHeaders } from '@angular/common/http';

export interface SecaoAdmin {
  id: number;
  titulo: string;
  titulo_cor_tipo?: 'solido' | 'gradiente';
  titulo_cor_solid?: string | null;
  titulo_gradiente_1?: string | null;
  titulo_gradiente_2?: string | null;
  url_fundo: string | null;
  cor_fundo: string | null;
  fundo_titulo: string | null;
  id_categoria: number | null;
  id_subcategoria: number | null;
  modo: 'aleatorio' | 'manual'; // novo campo
  ordem: number;
}

export interface ReceitaVinculada {
  id: number;
  titulo: string;
  imagem1: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class AdminSecaoService extends BaseService {

  private headers(userId: number): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': String(userId) });
  }

  listarSecoes(): Observable<SecaoAdmin[]> {
    return this.httpClient.get<SecaoAdmin[]>(
      this.url('admin/secoes.php')
    );
  }

  criarSecao(data: Partial<SecaoAdmin>, userId: number): Observable<any> {
    return this.httpClient.post(
      this.url('admin/secoes.php'),
      data,
      { headers: this.headers(userId) }
    );
  }

  atualizarSecao(id: number, data: Partial<SecaoAdmin>, userId: number): Observable<any> {
    return this.httpClient.put(
      this.url(`admin/secoes.php?id=${id}`),
      data,
      { headers: this.headers(userId) }
    );
  }

  excluirSecao(id: number, userId: number): Observable<any> {
    return this.httpClient.delete(
      this.url(`admin/secoes.php?id=${id}`),
      { headers: this.headers(userId) }
    );
  }

  // ── Gestão de receitas manuais ─────────────────────────────────────────────

  listarReceitasDaSecao(secaoId: number): Observable<ReceitaVinculada[]> {
    return this.httpClient.get<ReceitaVinculada[]>(
      this.url(`admin/secoes_receitas.php?secao_id=${secaoId}`)
    );
  }

  buscarReceitas(termo: string): Observable<{ id: number; titulo: string }[]> {
    return this.httpClient.get<{ id: number; titulo: string }[]>(
      this.url(`admin/secoes_receitas.php?busca=${encodeURIComponent(termo)}`)
    );
  }

  adicionarReceita(secaoId: number, receitaId: number, userId: number): Observable<any> {
    return this.httpClient.post(
      this.url('admin/secoes_receitas.php'),
      { secao_id: secaoId, receita_id: receitaId },
      { headers: this.headers(userId) }
    );
  }

  removerReceita(secaoId: number, receitaId: number, userId: number): Observable<any> {
    return this.httpClient.delete(
      this.url(`admin/secoes_receitas.php?secao_id=${secaoId}&receita_id=${receitaId}`),
      { headers: this.headers(userId) }
    );
  }
}

