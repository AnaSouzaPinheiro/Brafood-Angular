import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputAcesso } from './input-acesso';

describe('InputAcesso', () => {
  let component: InputAcesso;
  let fixture: ComponentFixture<InputAcesso>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputAcesso]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InputAcesso);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
