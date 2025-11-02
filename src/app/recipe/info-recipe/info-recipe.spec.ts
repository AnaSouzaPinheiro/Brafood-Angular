import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoRecipe } from './info-recipe';

describe('InfoRecipe', () => {
  let component: InfoRecipe;
  let fixture: ComponentFixture<InfoRecipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoRecipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoRecipe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
