import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';

export interface QuadroResumo {
  id: number;
  nome: string;
  descricao: string | null;
  total: number;
  capas: string[];
}

export interface QuadrosLista {
  favoritos: { total: number; capas: string[] };
  quadros: QuadroResumo[];
}

export interface QuadroDetalhe {
  quadro: { id: number; nome: string; descricao: string | null };
  receitas: any[];
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
