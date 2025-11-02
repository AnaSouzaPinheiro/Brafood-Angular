import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeSection } from './recipe-section';

describe('RecipeSection', () => {
  let component: RecipeSection;
  let fixture: ComponentFixture<RecipeSection>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeSection]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RecipeSection);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
