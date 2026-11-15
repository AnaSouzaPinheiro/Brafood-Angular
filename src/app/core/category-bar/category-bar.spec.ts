import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { CategoryBar } from './category-bar';

describe('CategoryBar', () => {
  let component: CategoryBar;
  let fixture: ComponentFixture<CategoryBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [CategoryBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CategoryBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
