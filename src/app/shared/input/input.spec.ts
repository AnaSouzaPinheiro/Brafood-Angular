import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { BraInput } from './input';

describe('BraInput', () => {
  let component: BraInput;
  let fixture: ComponentFixture<BraInput>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [BraInput]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BraInput);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});