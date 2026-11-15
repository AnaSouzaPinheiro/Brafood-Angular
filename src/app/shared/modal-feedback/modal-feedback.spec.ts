import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { ModalFeedback } from './modal-feedback';

describe('ModalFeedback', () => {
  let component: ModalFeedback;
  let fixture: ComponentFixture<ModalFeedback>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [ModalFeedback]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFeedback);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
