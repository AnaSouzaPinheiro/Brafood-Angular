import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HoverThings } from './hover-things';

describe('HoverThings', () => {
  let component: HoverThings;
  let fixture: ComponentFixture<HoverThings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
