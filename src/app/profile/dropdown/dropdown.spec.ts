import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { Dropdown } from './dropdown';

describe('Dropdown', () => {
  let component: Dropdown;
  let fixture: ComponentFixture<Dropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [Dropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Dropdown);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
