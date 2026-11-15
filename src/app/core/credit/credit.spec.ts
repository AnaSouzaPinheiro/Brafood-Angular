import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { Credit } from './credit';

describe('Credit', () => {
  let component: Credit;
  let fixture: ComponentFixture<Credit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [Credit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Credit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
