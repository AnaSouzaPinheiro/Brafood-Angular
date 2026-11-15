import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { RecipeResume } from './recipe-resume';

describe('RecipeResume', () => {
  let component: RecipeResume;
  let fixture: ComponentFixture<RecipeResume>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [RecipeResume]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeResume);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('resume', { title: 'Bolo', qtdFav: 3, text: 'Bolo simples' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
