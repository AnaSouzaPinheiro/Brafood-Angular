import { TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { EnviaEmailService } from './envia-email.service';

describe('EnviaEmailService', () => {
  let service: EnviaEmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: providersDeTeste });
    service = TestBed.inject(EnviaEmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
