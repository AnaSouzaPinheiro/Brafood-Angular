import { TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { PerfilPublicoService } from './perfil-publico.service';

describe('PerfilPublicoService', () => {
  let service: PerfilPublicoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: providersDeTeste });
    service = TestBed.inject(PerfilPublicoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
