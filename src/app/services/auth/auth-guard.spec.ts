import { provideHttpClient } from '@angular/common/http';
import {
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AuthGuard } from './auth-guard';

describe('AuthGuard', () => {
  let router: Router;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } },
      ],
    });
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('deve ser criado', () => {
    const guard = TestBed.inject(AuthGuard);
    expect(guard).toBeTruthy();
  });

  it('bloqueia e redireciona pro login quando não há sessão nenhuma', () => {
    const guard = TestBed.inject(AuthGuard);

    expect(guard.canActivate()).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('libera acesso quando já existe uma sessão válida no localStorage antes do guard ser criado', () => {
    // Esse é o teste que trava a regressão do bug original: antes, a
    // hidratação só acontecia dentro do navbar/user-icon, então um F5
    // direto numa página privada podia chegar no guard ANTES da sessão
    // ser lida do localStorage, e te chutar pro login por engano.
    // Agora a hidratação é feita no construtor do próprio AuthService,
    // então ela já está pronta no instante em que o AuthGuard é criado.
    localStorage.setItem('user', JSON.stringify({ id: 1, email: 'ana@teste.com' }));
    localStorage.setItem('token', 'token-valido');

    const guard = TestBed.inject(AuthGuard);

    expect(guard.canActivate()).toBeTrue();
    expect(router.navigate).not.toHaveBeenCalled();
  });
});