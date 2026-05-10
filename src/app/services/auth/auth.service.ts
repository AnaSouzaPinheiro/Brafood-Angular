import { Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../model/user';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService extends BaseService {

  user = signal<any>(null);
  
  login(email: string, senha: string): Observable<any> {
    return this.httpClient.post<any>(this.url('login.php'), { email, senha });
  }

  cadastro(
    nome: string,
    email: string,
    senha: string,
    confirmarSenha: string,
  ): Observable<any> {
    return this.httpClient.post<any>(this.url('cadastro.php'), {
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

  // Retorna os dados do usuário logado
  getUser(): any {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }
}
