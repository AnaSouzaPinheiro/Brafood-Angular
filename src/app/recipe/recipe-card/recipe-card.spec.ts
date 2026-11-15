import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { RecipeCard } from './recipe-card';

describe('RecipeCard', () => {
  let component: RecipeCard;
  let fixture: ComponentFixture<RecipeCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [RecipeCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
