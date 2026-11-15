import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { CustomButton } from './custom-button';

describe('CustomButton', () => {
  let component: CustomButton;
  let fixture: ComponentFixture<CustomButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [CustomButton]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomButton);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
