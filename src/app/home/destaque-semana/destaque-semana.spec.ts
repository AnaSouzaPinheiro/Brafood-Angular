import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DestaqueSemana } from './destaque-semana';

describe('DestaqueSemana', () => {
  let component: DestaqueSemana;
  let fixture: ComponentFixture<DestaqueSemana>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DestaqueSemana]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestaqueSemana);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
