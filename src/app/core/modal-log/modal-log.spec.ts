import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalLog } from './modal-log';

describe('ModalLog', () => {
  let component: ModalLog;
  let fixture: ComponentFixture<ModalLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalLog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalLog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
