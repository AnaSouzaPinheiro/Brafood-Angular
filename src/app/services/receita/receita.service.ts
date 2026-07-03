import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../model/api-response';
import { Recipes } from '../../model/myrecipes';
import { Receita } from '../../model/receita';
import { Slide } from '../../model/slide';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class ReceitaService extends BaseService {
  // Lista todas as receitas
  list(): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(this.url('receitas.php'));
  }

  // listar por user
  listPorUser(id: number): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(
      this.url(`minhas_receitas.php?id=${id}`),
    );
  }

  // Lista todas as receitas por título (busca)
  listForSerach(pesquisa: string): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(
      this.url(`receitas.php?pesquisa=${pesquisa}`),
    );
  }

  // excluir uma receita
  excluir(id: number): Observable<ApiResponse> {
    return this.httpClient.get<ApiResponse>(
      this.url(`receitas/excluir.php?id=${id}`),
    );
  }

  // Lista receitas por categoria (usando id e nome na URL)
  listCat(
    categoria: { id: number; nome: string },
    filtros?: any,
  ): Observable<Recipes[]> {
    let params = new HttpParams().set('id', categoria.id.toString());

    if (categoria.nome) {
      params = params.set('nome', categoria.nome);
    }

    if (filtros?.ordenar) {
      params = params.set('ordenar', filtros.ordenar);
    }

    if (filtros?.subcategorias?.length) {
      filtros.subcategorias.forEach((id: number) => {
        params = params.append('subcategorias[]', id.toString());
      });
    }

    if (filtros?.dificuldades?.length) {
      filtros.dificuldades.forEach((d: number) => {
        params = params.append('dificuldades[]', d.toString());
      });
    }

    if (filtros?.tiposPorcao?.length) {
      filtros.tiposPorcao.forEach((t: string) => {
        params = params.append('tipos_porcao[]', t);
      });
    }

    if (filtros?.tempoMax != null) {
      params = params.set('tempo_max', filtros.tempoMax.toString());
    }

    return this.httpClient.get<Recipes[]>(this.url('receitas_categoria.php'), {
      params,
    });
  }

  // Lista receitas aleatórias pro slide da home
  listRandom(limit: number): Observable<Slide[]> {
    return this.httpClient.get<Slide[]>(
      this.url(`slide_home.php?limit=${limit}`),
    );
  }

  // Busca receita específica pelo ID
  buscarPorId(id: number): Observable<Receita> {
    return this.httpClient.get<Receita>(
      this.url(`receitas/buscar.php?id=${id}`),
    );
  }

  // Envia uma nova receita (dados + capa + galeria)
  // `capa` é a imagem principal (obrigatória); `galeria` são as imagens
  // adicionais, em qualquer quantidade.
  addReceita(
    formValue: any,
    capa: File | null,
    galeria: File[] = [],
  ): Observable<ApiResponse> {
    const formData = new FormData();
    formData.append('dados', JSON.stringify(formValue));

    if (capa) formData.append('imagem1', capa);
    galeria.forEach((img) => formData.append('galeria[]', img));

    return this.httpClient.post<ApiResponse>(
      this.url('receitas/add.php'),
      formData,
    );
  }

  updateReceita(
    id: number,
    formValue: any,
    capa: File | null,
    galeriaAtual: string[],
    galeriaNova: File[] = [],
  ): Observable<ApiResponse> {
    const formData = new FormData();

    // `galeriaAtual`: caminhos das imagens existentes que o usuário manteve
    // (as removidas na tela simplesmente não entram aqui).
    formData.append(
      'dados',
      JSON.stringify({ ...formValue, galeriaAtual }),
    );

    if (capa) formData.append('imagem1', capa);
    galeriaNova.forEach((img) => formData.append('galeria[]', img));

    return this.httpClient.post<ApiResponse>(
      this.url(`receitas/update.php?id=${id}`),
      formData,
    );
  }
}
