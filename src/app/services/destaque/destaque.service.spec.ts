import { TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { DestaqueService } from './destaque.service';

describe('DestaqueService', () => {
  let service: DestaqueService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: providersDeTeste });
    service = TestBed.inject(DestaqueService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
