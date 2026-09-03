import { provideHttpClient } from '@angular/common/http';
import {
    HttpTestingController,
    provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { FavoritoService } from './favorito.service';

describe('FavoritoService', () => {
  let service: FavoritoService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiUrl}/routes`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FavoritoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('listarFavoritos() deve fazer GET com o id do usuário', () => {
    service.listarFavoritos(1).subscribe();

    const req = httpMock.expectOne(`${base}/favorito.php?idUser=1`);
    expect(req.request.method).toBe('GET');
    req.flush([]);
  });

  it('isFavorita() deve fazer GET com check=1, idUser e idReceita', () => {
    service.isFavorita(1, 99).subscribe((res) => {
      expect(res.favorite).toBeTrue();
    });

    const req = httpMock.expectOne(
      `${base}/favorito.php?check=1&idUser=1&idReceita=99`,
    );
    expect(req.request.method).toBe('GET');
    req.flush({ favorite: true });
  });

  it('favoritar() deve fazer POST com idUser e idReceita no corpo', () => {
    service.favoritar(1, 99).subscribe();

    const req = httpMock.expectOne(`${base}/favorito.php`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ idUser: 1, idReceita: 99 });
    req.flush({ success: true });
  });

  it('desfavoritar() deve fazer DELETE com idUser e idReceita no corpo', () => {
    service.desfavoritar(1, 99).subscribe();

    const req = httpMock.expectOne(`${base}/favorito.php`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.body).toEqual({ idUser: 1, idReceita: 99 });
    req.flush({ success: true });
  });
});