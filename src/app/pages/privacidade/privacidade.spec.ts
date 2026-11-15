import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { Privacidade } from './privacidade';

describe('Privacidade', () => {
  let component: Privacidade;
  let fixture: ComponentFixture<Privacidade>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [Privacidade]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Privacidade);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
