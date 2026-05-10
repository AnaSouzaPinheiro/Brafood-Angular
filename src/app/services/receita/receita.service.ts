import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipes } from '../../model/myrecipes';
import { Slide } from '../../model/slide';
import { Receita } from '../../model/receita';
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
  excluir(id: number): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(
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

  // Envia uma nova receita (dados + imagens)
  addReceita(formValue: any, imagens: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('dados', JSON.stringify(formValue));

    // Adiciona até 3 imagens, se existirem
    imagens.forEach((img, i) => {
      if (img) formData.append(`imagem${i + 1}`, img);
    });

    return this.httpClient.post<any>(this.url('receitas/add.php'), formData);
  }

  updateReceita(id: number, formValue: any, imagens: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('dados', JSON.stringify(formValue));

    // Adiciona até 3 imagens, se existirem
    imagens.forEach((img, i) => {
      if (img) formData.append(`imagem${i + 1}`, img);
    });

    return this.httpClient.post<any>(
      this.url(`receitas/update.php?id=${id}`),
      formData,
    );
  }
}
