import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { ResetarSenha } from './resetar-senha';

describe('ResetarSenha', () => {
  let component: ResetarSenha;
  let fixture: ComponentFixture<ResetarSenha>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [ResetarSenha]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResetarSenha);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
