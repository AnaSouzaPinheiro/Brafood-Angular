import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  const fakeUser = { id: 42, nome: 'Ana', email: 'ana@teste.com', is_admin: 0 };
  const fakeToken = 'token-de-teste-123';

  beforeEach(() => {
    // Garante que nenhum teste anterior deixou lixo no localStorage
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('não deve estar logado quando não há nada no localStorage', () => {
    expect(service.isLoggedIn()).toBeFalse();
    expect(service.user()).toBeNull();
    expect(service.getToken()).toBeNull();
  });

  it('deve hidratar o usuário/token já existentes no localStorage ao ser criado', () => {
    // Simula uma sessão que já existia antes do serviço ser instanciado —
    // é exatamente o cenário de um F5 numa página privada.
    localStorage.setItem('user', JSON.stringify(fakeUser));
    localStorage.setItem('token', fakeToken);

    // Precisa criar uma instância NOVA pra rodar o construtor de novo
    // (o TestBed padrão do beforeEach já criou uma sem esses dados).
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const freshService = TestBed.inject(AuthService);

    expect(freshService.isLoggedIn()).toBeTrue();
    expect(freshService.user().id).toBe(fakeUser.id);
    expect(freshService.getToken()).toBe(fakeToken);
  });

  it('saveUserSession deve salvar usuário e token no localStorage e no signal', () => {
    service.saveUserSession(fakeUser as any, fakeToken);

    expect(service.user()).toEqual(fakeUser as any);
    expect(service.getToken()).toBe(fakeToken);
    expect(service.isLoggedIn()).toBeTrue();

    expect(JSON.parse(localStorage.getItem('user')!)).toEqual(fakeUser);
    expect(localStorage.getItem('token')).toBe(fakeToken);
  });

  it('logout deve limpar usuário, token e localStorage, e avisar o backend', () => {
    service.saveUserSession(fakeUser as any, fakeToken);

    service.logout();

    expect(service.user()).toBeNull();
    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBeFalse();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();

    // logout() dispara um POST best-effort pro backend invalidar o token
    const req = httpMock.expectOne(`${environment.apiUrl}/routes/logout.php`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true });
  });

  it('login deve fazer POST em login.php com email e senha', () => {
    service.login('ana@teste.com', 'senha123').subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/routes/login.php`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      email: 'ana@teste.com',
      senha: 'senha123',
    });
    req.flush({ success: true, user: fakeUser, token: fakeToken });
  });

  it('isLoggedIn deve ser falso se só o usuário existir sem token (token expirado/limpo)', () => {
    service.user.set(fakeUser as any);
    // token nunca foi setado — cenário de token limpo no servidor mas
    // localStorage do usuário ainda com resquício de sessão antiga
    expect(service.isLoggedIn()).toBeFalse();
  });
});