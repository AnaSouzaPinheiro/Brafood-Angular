import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { AddRecipe } from './add-recipe';

describe('AddRecipe', () => {
  let component: AddRecipe;
  let fixture: ComponentFixture<AddRecipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [AddRecipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRecipe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
