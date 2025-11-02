import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeResume } from './recipe-resume';

describe('RecipeResume', () => {
  let component: RecipeResume;
  let fixture: ComponentFixture<RecipeResume>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeResume]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeResume);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
