import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { AddRecipeHub } from './add-recipe-hub';

describe('AddRecipeHub', () => {
  let component: AddRecipeHub;
  let fixture: ComponentFixture<AddRecipeHub>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [AddRecipeHub]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddRecipeHub);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
