import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { Favoritas } from './favoritas';

describe('Favoritas', () => {
  let component: Favoritas;
  let fixture: ComponentFixture<Favoritas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [Favoritas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Favoritas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
