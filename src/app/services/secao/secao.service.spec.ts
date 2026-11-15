import { TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { SecaoService } from './secao.service';

describe('SecaoService', () => {
  let service: SecaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: providersDeTeste });
    service = TestBed.inject(SecaoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
