import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { RecipeSection } from './recipe-section';

describe('RecipeSection', () => {
  let component: RecipeSection;
  let fixture: ComponentFixture<RecipeSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [RecipeSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeSection);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('section', { id: 1, title: 'Natal', urlSection: null, corFundo: '#ffffff', fundoTitle: null, ordem: 1, recipes: [], tituloCorTipo: 'solido', tituloCorSolid: '#000000', tituloGradiente1: null, tituloGradiente2: null });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
