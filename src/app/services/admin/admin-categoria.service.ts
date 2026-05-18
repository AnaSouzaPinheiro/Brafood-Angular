import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { Categoria, Subcategoria } from '../../model/categoria';
import { HttpHeaders } from '@angular/common/http';

export interface CategoriaAdmin {
  id: number;
  nome: string;
  icone: string | null;
  fundo: string | null;
  css_class: string | null;
  ordem: number;
  cor_primaria: string | null;
  gradiente_hover: string | null;
}

export interface SubcategoriaAdmin {
  id: number;
  nome: string;
  id_categoria: number;
  nome_categoria: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminCategoriaService extends BaseService {

  private headers(userId: number): HttpHeaders {
    return new HttpHeaders({ 'X-User-Id': String(userId) });
  }

  // ── Categorias ────────────────────────────────────────────

  listarCategorias(): Observable<CategoriaAdmin[]> {
    return this.httpClient.get<CategoriaAdmin[]>(
      this.url('admin/categorias.php')
    );
  }

  /** Apenas categorias que têm ao menos uma receita — para os selects de filtro de seção */
  listarCategoriasComReceitas(): Observable<CategoriaAdmin[]> {
    return this.httpClient.get<CategoriaAdmin[]>(
      this.url('admin/categorias.php?com_receitas=1')
    );
  }

  criarCategoria(data: Partial<CategoriaAdmin>, userId: number): Observable<any> {
    return this.httpClient.post(
      this.url('admin/categorias.php'),
      data,
      { headers: this.headers(userId) }
    );
  }

  atualizarCategoria(id: number, data: Partial<CategoriaAdmin>, userId: number): Observable<any> {
    return this.httpClient.put(
      this.url(`admin/categorias.php?id=${id}`),
      data,
      { headers: this.headers(userId) }
    );
  }

  excluirCategoria(id: number, userId: number): Observable<any> {
    return this.httpClient.delete(
      this.url(`admin/categorias.php?id=${id}`),
      { headers: this.headers(userId) }
    );
  }

  // ── Subcategorias ────────────────────────────────────────

  listarSubcategorias(idCategoria?: number): Observable<SubcategoriaAdmin[]> {
    const qs = idCategoria ? `?id_categoria=${idCategoria}` : '';
    return this.httpClient.get<SubcategoriaAdmin[]>(
      this.url(`admin/subcategorias.php${qs}`)
    );
  }

  /** Apenas subcategorias com receitas — para o select de filtro de seção */
  listarSubcategoriasComReceitas(idCategoria?: number): Observable<SubcategoriaAdmin[]> {
    const base = `admin/subcategorias.php?com_receitas=1`;
    const qs   = idCategoria ? `&id_categoria=${idCategoria}` : '';
    return this.httpClient.get<SubcategoriaAdmin[]>(this.url(base + qs));
  }

  criarSubcategoria(nome: string, idCategoria: number, userId: number): Observable<any> {
    return this.httpClient.post(
      this.url('admin/subcategorias.php'),
      { nome, id_categoria: idCategoria },
      { headers: this.headers(userId) }
    );
  }

  atualizarSubcategoria(id: number, nome: string, idCategoria: number, userId: number): Observable<any> {
    return this.httpClient.put(
      this.url(`admin/subcategorias.php?id=${id}`),
      { nome, id_categoria: idCategoria },
      { headers: this.headers(userId) }
    );
  }

  excluirSubcategoria(id: number, userId: number): Observable<any> {
    return this.httpClient.delete(
      this.url(`admin/subcategorias.php?id=${id}`),
      { headers: this.headers(userId) }
    );
  }
}
