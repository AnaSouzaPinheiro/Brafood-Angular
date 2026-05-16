import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../model/user';
import { BaseService } from '../base/base.service';
import { ApiResponse } from '../../model/api-response';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  user = signal<any>(null);

  login(
    email: string,
    senha: string,
  ): Observable<ApiResponse & { user?: User }> {
    return this.httpClient.post<ApiResponse & { user?: User }>(
      this.url('login.php'),
      { email, senha },
    );
  }

  cadastro(
    nome: string,
    email: string,
    senha: string,
    confirmarSenha: string,
  ): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(this.url('cadastro.php'), {
      nome,
      email,
      senha,
      confirmarSenha,
    });
  }

  saveUserSession(user: User) {
    this.user.set(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', String(user.id));
  }

  logout() {
    this.user.set(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
  }

  isLoggedIn(): boolean {
    return this.user() !== null;
  }

  loadFromStorage() {
    // só roda se estiver no navegador
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('user');
      if (data) {
        this.user.set(JSON.parse(data));
      }
    }
  }

  solicitarRecuperacao(email: string): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(
      this.url('solicitar_recuperacao.php'),
      {
        email,
      },
    );
  }

  resetarSenha(
    token: string,
    senha: string,
    confirmarSenha: string,
  ): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(this.url('resetar_senha.php'), {
      token,
      senha,
      confirmarSenha,
    });
  }

  // Retorna os dados do usuário logado
  getUser(): any {
    // Prioriza o signal (já carregado em memória); cai no storage como fallback
    return (
      this.user() ??
      (() => {
        const data = localStorage.getItem('user');
        return data ? JSON.parse(data) : null;
      })()
    );
  }

  // Atalho para obter só o ID — evita que os componentes acessem localStorage diretamente
  getUserId(): number | null {
    return this.getUser()?.id ?? null;
  }
}
