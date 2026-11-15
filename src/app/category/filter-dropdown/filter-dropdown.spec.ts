import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { FilterDropdown } from './filter-dropdown';

describe('FilterDropdown', () => {
  let component: FilterDropdown;
  let fixture: ComponentFixture<FilterDropdown>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [FilterDropdown]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterDropdown);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('optionsDropwdown', { labelTitle: 'Ordenar', items: [{ id: 1, name: 'Por nome', checked: false }] });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
