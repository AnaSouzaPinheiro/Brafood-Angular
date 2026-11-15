import { TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { NewsletterService } from './newsletter.service';

describe('NewsletterService', () => {
  let service: NewsletterService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: providersDeTeste });
    service = TestBed.inject(NewsletterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
