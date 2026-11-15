import { ComponentFixture, TestBed } from '@angular/core/testing';
import { providersDeTeste } from '../../testing/providers';

import { BannerHome } from './banner-home';

describe('BannerHome', () => {
  let component: BannerHome;
  let fixture: ComponentFixture<BannerHome>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: providersDeTeste,
      imports: [BannerHome]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BannerHome);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('recipe', { img: 'foto.jpg', url: '/receita/bolo/1', resume: { title: 'Bolo', qtdFav: 3, text: 'Bolo simples' } });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
