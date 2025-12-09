import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipes } from '../model/myrecipes';
import { Slide } from '../model/slide';
import { Receita } from '../model/receita';
import { User } from '../model/user';

@Injectable({
  providedIn: 'root',
})
export class MyRecipesService {
  // URL base da API
  private readonly API =
    'http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes';

  private httpClient = inject(HttpClient);

  // Método auxiliar pra evitar repetição
  private url(path: string): string {
    return `${this.API}/${path}`;
  }

  // Lista todas as receitas
  list(): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(this.url('receitas.php'));
  }

  // listar por user
  listPorUser(id: number): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(
      this.url(`minhas_receitas.php?id=${id}`)
    );
  }

  // Lista todas as receitas
  listForSerach(pesquisa: string): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(
      this.url(`receitas.php?pesquisa=${pesquisa}`)
    );
  }

  // Lista todas as receitas
  excluir(id: number): Observable<Recipes[]> {
    return this.httpClient.get<Recipes[]>(
      this.url(`receitas/excluir.php?id=${id}`)
    );
  }

  // Lista receitas por categoria (usando id e nome na URL)
  listCat(
    categoria: { id: number; nome: string },
    filtros?: any
  ): Observable<Recipes[]> {
    let params: any = {};

    if (filtros?.ordenar) {
      params.ordenar = filtros.ordenar;
    }

    if (filtros?.subcategorias && filtros.subcategorias.length > 0) {
      params.subcategorias = filtros.subcategorias; // automaticamente vira array no GET
    }

    return this.httpClient.get<Recipes[]>(
      this.url(
        `receitas_categoria.php?id=${categoria.id}&nome=${encodeURIComponent(
          categoria.nome
        )}`
      ),
      { params }
    );
  }

  // Lista receitas aleatórias pro slide da home
  listRandom(limit: number): Observable<Slide[]> {
    return this.httpClient.get<Slide[]>(
      this.url(`slide_home.php?limit=${limit}`)
    );
  }

  // Busca receita específica pelo ID
  buscarPorId(id: number): Observable<Receita> {
    return this.httpClient.get<Receita>(
      this.url(`receitas/buscar.php?id=${id}`)
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

    return this.httpClient.post<any>(
      'http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes/receitas/add.php',
      formData
    );
  }

  updateReceita(id: number, formValue: any, imagens: File[]): Observable<any> {
    const formData = new FormData();
    formData.append('dados', JSON.stringify(formValue));

    // Adiciona até 3 imagens, se existirem
    imagens.forEach((img, i) => {
      if (img) formData.append(`imagem${i + 1}`, img);
    });

    return this.httpClient.post<any>(
      `http://localhost/BraFood-Angular-PHP/BraFood-PHP/routes/receitas/update.php?id=${id}`,
      formData
    );
  }

  // Busca receita específica pelo ID
  buscarUserPorId(id: number): Observable<User[]> {
    return this.httpClient.get<User[]>(this.url(`user.php?id=${id}`));
  }

  login(email: string, senha: string): Observable<any> {
    return this.httpClient.post<any>(this.url('login.php'), { email, senha });
  }

  cadastro(
    nome: string,
    email: string,
    senha: string,
    confirmarSenha: string
  ): Observable<any> {
    return this.httpClient.post<any>(this.url('cadastro.php'), {
      nome,
      email,
      senha,
      confirmarSenha,
    });
  }

  solicitarRecuperacao(email: string) {
    return this.httpClient.post(this.url('solicitar_recuperacao.php'), {
      email,
    });
  }

  resetarSenha(token: string, senha: string, confirmarSenha: string) {
    return this.httpClient.post(this.url('resetar_senha.php'), {
      token,
      senha,
      confirmarSenha,
    });
  }

  // Verifica se o usuário está logado
  isLoggedIn(): boolean {
    return !!localStorage.getItem('user');
  }

  // Retorna os dados do usuário logado
  getUser(): any {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  // Faz logout
  logout() {
    localStorage.removeItem('user');
  }
}
