import { TestBed } from '@angular/core/testing';

import { SecaoCarrossel } from './secao-carrossel';

describe('SecaoCarrossel', () => {
  let service: SecaoCarrossel;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecaoCarrossel);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
