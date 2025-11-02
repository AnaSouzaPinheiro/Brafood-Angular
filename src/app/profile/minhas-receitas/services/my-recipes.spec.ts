import { TestBed } from '@angular/core/testing';

import { MyRecipes } from './my-recipes';

describe('MyRecipes', () => {
  let service: MyRecipes;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MyRecipes);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
