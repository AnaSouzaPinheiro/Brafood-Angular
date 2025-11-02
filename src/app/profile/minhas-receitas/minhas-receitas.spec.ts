import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MinhasReceitas } from './minhas-receitas';

describe('MinhasReceitas', () => {
  let component: MinhasReceitas;
  let fixture: ComponentFixture<MinhasReceitas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MinhasReceitas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MinhasReceitas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
