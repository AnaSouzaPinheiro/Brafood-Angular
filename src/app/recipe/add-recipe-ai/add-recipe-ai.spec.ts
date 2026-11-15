import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { AddRecipeAi } from './add-recipe-ai';

describe('AddRecipeAi', () => {
  let component: AddRecipeAi;
  let fixture: ComponentFixture<AddRecipeAi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [AddRecipeAi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRecipeAi);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
