import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRecipe } from './update-recipe';

describe('UpdateRecipe', () => {
  let component: UpdateRecipe;
  let fixture: ComponentFixture<UpdateRecipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UpdateRecipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UpdateRecipe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
