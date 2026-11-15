import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { providersDeTeste } from './testing/providers';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the router outlet and the global layout elements', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('bra-modal-feedback')).toBeTruthy();
    expect(compiled.querySelector('bra-cookie-banner')).toBeTruthy();
  });
});
