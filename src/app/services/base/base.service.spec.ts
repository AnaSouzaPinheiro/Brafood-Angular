import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { providersDeTeste } from '../../testing/providers';
import { BaseService } from './base.service';

// BaseService é abstrata: testamos por uma subclasse mínima
@Injectable()
class ServicoDeTeste extends BaseService {
  montar(caminho: string): string {
    return this.url(caminho);
  }
}

describe('BaseService', () => {
  let service: ServicoDeTeste;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [...providersDeTeste, ServicoDeTeste],
    });
    service = TestBed.inject(ServicoDeTeste);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('monta a URL da API a partir do environment', () => {
    expect(service.montar('login.php')).toBe(`${environment.apiUrl}/routes/login.php`);
  });

  it('preserva subpastas e query string', () => {
    expect(service.montar('admin/categorias.php?id=3')).toBe(
      `${environment.apiUrl}/routes/admin/categorias.php?id=3`,
    );
  });
});
