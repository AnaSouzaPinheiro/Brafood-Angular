import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../model/api-response';
import { User } from '../../model/user';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {
  user = signal<any>(null);
  private token: string | null = null;

  constructor() {
    super();
    // Hidrata a sessão já na criação do serviço — não em ngOnInit de algum
    // componente. Como AuthGuard injeta AuthService antes de rodar
    // canActivate(), isso garante que o signal já está populado quando o
    // guard checa isLoggedIn(), evitando um falso "não logado" num F5 numa
    // página privada.
    this.loadFromStorage();
  }

  login(
    email: string,
    senha: string,
  ): Observable<ApiResponse & { user?: User; token?: string }> {
    return this.httpClient.post<ApiResponse & { user?: User; token?: string }>(
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

  saveUserSession(user: User, token: string) {
    this.user.set(user);
    this.token = token;
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('token', token);
  }

  logout() {
    // Best-effort: avisa o backend pra invalidar o token no banco também.
    // Não bloqueia o logout local mesmo se a chamada falhar.
    this.httpClient.post(this.url('logout.php'), {}).subscribe({
      error: () => {},
    });

    this.user.set(null);
    this.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return this.user() !== null && !!this.getToken();
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
    return this.token;
  }

  loadFromStorage() {
    // só roda se estiver no navegador
    if (typeof window !== 'undefined') {
      const data = localStorage.getItem('user');
      if (data) {
        this.user.set(JSON.parse(data));
      }
      this.token = localStorage.getItem('token');
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
        if (typeof window === 'undefined') return null;
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