import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilPublicoPage } from './perfil-publico';

describe('PerfilPublicoPage', () => {
  let component: PerfilPublicoPage;
  let fixture: ComponentFixture<PerfilPublicoPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilPublicoPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PerfilPublicoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});