import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { SlideHome } from './slide-home';

describe('SlideHome', () => {
  let component: SlideHome;
  let fixture: ComponentFixture<SlideHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [SlideHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SlideHome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
