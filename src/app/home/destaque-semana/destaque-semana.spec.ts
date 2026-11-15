import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { DestaqueSemana } from './destaque-semana';

describe('DestaqueSemana', () => {
  let component: DestaqueSemana;
  let fixture: ComponentFixture<DestaqueSemana>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [DestaqueSemana]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DestaqueSemana);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recipe', { id: 1, titulo: 'Bolo de fubá', resumo: 'Simples', imagem1: null, qtd_fav: 2, media_avaliacao: 4.5, qtd_avaliacoes: 2, destaque_desde: null, autor: 'Ana', categoria: 'Sobremesas', subcategoria: null });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
