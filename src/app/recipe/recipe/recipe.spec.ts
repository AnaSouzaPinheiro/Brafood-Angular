import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { Recipe } from './recipe';

describe('Recipe', () => {
  let component: Recipe;
  let fixture: ComponentFixture<Recipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [Recipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Recipe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
