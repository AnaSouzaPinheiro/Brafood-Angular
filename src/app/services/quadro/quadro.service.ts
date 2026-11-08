import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';

export interface QuadroResumo {
  id: number;
  nome: string;
  descricao: string | null;
  total: number;
  capas: string[];
  publico?: boolean;
  token_publico?: string | null;
}

export interface QuadrosLista {
  favoritos: { total: number; capas: string[] };
  quadros: QuadroResumo[];
}

export interface QuadroDetalhe {
  quadro: {
    id: number;
    nome: string;
    descricao: string | null;
    publico: boolean;
    token_publico: string | null;
  };
  receitas: any[];
}

/** Quadro compartilhado, visto por qualquer pessoa (sem status/nota). */
export interface QuadroPublico {
  quadro: { nome: string; descricao: string | null };
  autor: { nome: string; apelido: string; foto: string | null };
  receitas: any[];
}

/** Lista de compras: ingredientes agrupados por receita. */
export interface ReceitaCompras {
  id: number;
  titulo: string;
  grupos: { titulo: string; itens: string[] }[];
}

export type StatusReceita = 'quero_fazer' | 'ja_fiz' | null;

export interface EstadoReceita {
  favorito: boolean;
  status: StatusReceita;
  nota: string | null;
  quadros: number[];
}

export interface QuadroResposta {
  success: boolean;
  id?: number;
  error?: string;
}

/** Quadros de receitas salvas. O usuário vem do token, nunca do cliente. */
@Injectable({ providedIn: 'root' })
export class QuadroService extends BaseService {
  // ---- compartilhar ----------------------------------------------------------
  definirPublico(id: number, publico: boolean) {
    return this.httpClient.put<QuadroResposta & { token?: string; publico?: boolean }>(
      this.url('quadros.php'),
      { id, publico },
    );
  }

  /** Visão pública (sem login) de um quadro compartilhado. */
  publico(token: string): Observable<QuadroPublico> {
    return this.httpClient.get<QuadroPublico>(
      this.url(`quadro_publico.php?token=${encodeURIComponent(token)}`),
    );
  }

  /** Quadros públicos de um usuário (perfil público). */
  publicosDoUsuario(apelido: string): Observable<QuadroResumo[]> {
    return this.httpClient.get<QuadroResumo[]>(
      this.url(`quadro_publico.php?apelido=${encodeURIComponent(apelido)}`),
    );
  }

  // ---- ordenar ---------------------------------------------------------------
  reordenarQuadros(ordem: number[]) {
    return this.httpClient.put<QuadroResposta>(this.url('quadros.php'), { ordem });
  }

  reordenarReceitas(idQuadro: number, ordemReceitas: number[]) {
    return this.httpClient.put<QuadroResposta>(this.url('quadros.php'), {
      idQuadro,
      ordemReceitas,
    });
  }

  // ---- lista de compras --------------------------------------------------------
  listaDeCompras(idQuadro: number, idsReceitas: number[]): Observable<ReceitaCompras[]> {
    return this.httpClient.get<ReceitaCompras[]>(
      this.url(`quadros.php?compras=${idQuadro}&ids=${idsReceitas.join(',')}`),
    );
  }

  listar(): Observable<QuadrosLista> {
    return this.httpClient.get<QuadrosLista>(this.url('quadros.php'));
  }

  detalhe(id: number): Observable<QuadroDetalhe> {
    return this.httpClient.get<QuadroDetalhe>(this.url(`quadros.php?id=${id}`));
  }

  /** Se a receita é favorita e em quais quadros ela está. */
  estadoDaReceita(idReceita: number) {
    return this.httpClient.get<EstadoReceita>(
      this.url(`quadros.php?idReceita=${idReceita}`),
    );
  }

  /** Cria o quadro, opcionalmente já com receitas dentro. */
  criar(nome: string, descricao?: string | null, idsReceitas: number[] = []) {
    return this.httpClient.post<QuadroResposta>(this.url('quadros.php'), {
      nome,
      descricao,
      idsReceitas,
    });
  }

  adicionarVarias(idQuadro: number, idsReceitas: number[]) {
    return this.httpClient.post<QuadroResposta>(this.url('quadros.php'), {
      idQuadro,
      idsReceitas,
    });
  }

  editar(id: number, nome: string, descricao?: string | null) {
    return this.httpClient.put<QuadroResposta>(this.url('quadros.php'), {
      id,
      nome,
      descricao,
    });
  }

  excluir(id: number) {
    return this.httpClient.request<QuadroResposta>('DELETE', this.url('quadros.php'), {
      body: { id },
    });
  }

  adicionarReceita(idQuadro: number, idReceita: number) {
    return this.httpClient.post<QuadroResposta>(this.url('quadros.php'), {
      idQuadro,
      idReceita,
    });
  }

  removerVarias(idQuadro: number, idsReceitas: number[]) {
    return this.httpClient.request<QuadroResposta>('DELETE', this.url('quadros.php'), {
      body: { idQuadro, idsReceitas },
    });
  }

  removerReceita(idQuadro: number, idReceita: number) {
    return this.httpClient.request<QuadroResposta>('DELETE', this.url('quadros.php'), {
      body: { idQuadro, idReceita },
    });
  }
}
