import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { LegalPage } from './legal-page';

describe('LegalPage', () => {
  let component: LegalPage;
  let fixture: ComponentFixture<LegalPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [LegalPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
