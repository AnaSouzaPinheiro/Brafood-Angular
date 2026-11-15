import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { HoverThings } from './hover-things';

describe('HoverThings', () => {
  let component: HoverThings;
  let fixture: ComponentFixture<HoverThings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [HoverThings]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HoverThings);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
