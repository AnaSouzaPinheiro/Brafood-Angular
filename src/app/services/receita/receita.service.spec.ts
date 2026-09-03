import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { ReceitaService } from './receita.service';

describe('ReceitaService', () => {
  let service: ReceitaService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/routes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ReceitaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('list() deve fazer GET em receitas.php', () => {
    service.list().subscribe();

    const req = httpMock.expectOne(`${base}/receitas.php`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listPorUser() deve fazer GET em minhas_receitas.php com o id do usuário', () => {
    service.listPorUser(42).subscribe();

    const req = httpMock.expectOne(`${base}/minhas_receitas.php?id=42`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('listForSerach() deve fazer GET com o termo de busca na query', () => {
    service.listForSerach('bolo de cenoura').subscribe();

    const req = httpMock.expectOne(
      `${base}/receitas.php?pesquisa=bolo de cenoura`,
    );
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('excluir() deve fazer DELETE (não GET) em receitas/excluir.php', () => {
    // Esse é o teste que trava a regressão do bug de ação destrutiva
    // via GET — se alguém trocar de volta pra .get(), o teste quebra.
    service.excluir(7).subscribe();

    const req = httpMock.expectOne(`${base}/receitas/excluir.php?id=7`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true });
  });
});