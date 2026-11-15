import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { InputImages } from './input-images';

describe('InputImages', () => {
  let component: InputImages;
  let fixture: ComponentFixture<InputImages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [InputImages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputImages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
