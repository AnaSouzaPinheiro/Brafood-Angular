import { TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { ComentarioService } from './comentario.service';

describe('ComentarioService', () => {
  let service: ComentarioService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: providersDeTeste });
    service = TestBed.inject(ComentarioService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
