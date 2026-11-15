import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { UserIcon } from './user-icon';

describe('UserIcon', () => {
  let component: UserIcon;
  let fixture: ComponentFixture<UserIcon>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [UserIcon]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserIcon);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
