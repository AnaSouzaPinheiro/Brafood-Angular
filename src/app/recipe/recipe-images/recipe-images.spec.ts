import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeImages } from './recipe-images';

describe('RecipeImages', () => {
  let component: RecipeImages;
  let fixture: ComponentFixture<RecipeImages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeImages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeImages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
