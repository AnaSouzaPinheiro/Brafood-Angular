import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { RouterModule } from '@angular/router';

import { RouterOutlet } from '@angular/router';
import { Credit } from './core/credit/credit';
import { Navbar } from './core/navbar/navbar';
import { CategoryBar } from './core/category-bar/category-bar';
import { Footer } from './core/footer/footer';
import { ModalFeedback } from './shared/modal-feedback/modal-feedback';
import { CookieBanner } from './core/cookie-banner/cookie-banner';
import { Toast } from './shared/toast/toast';
import { BarraProgresso } from './shared/barra-progresso/barra-progresso';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    BarraProgresso,
    RouterOutlet,
    CommonModule,
    Navbar,
    CategoryBar,
    Footer,
    Credit,
    RouterModule,
    ModalFeedback,
    CookieBanner,
    Toast,
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  showLayout = true;
  isBrowser = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
  ) {
    // Detecta se está no browser
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (this.isBrowser) this.ativarFadeDeImagens();

    if (this.isBrowser) {
      this.router.events
        .pipe(filter((event) => event instanceof NavigationEnd))
        .subscribe((event: NavigationEnd) => {
          const url = event.urlAfterRedirects.replace('/', '');
          const hideOn = [
            'login',
            'cadastro',
            'recuperar-senha',
            'resetar-senha',
          ];

          this.showLayout = !hideOn.some((path) => url.startsWith(path));
        });
    }
  }

  /**
   * Imagens com o atributo data-fade aparecem com fade quando terminam
   * de carregar (em vez de "pintar" aos pedaços). Um único ouvinte no
   * documento cobre o site todo; o CSS fica em styles.scss.
   */
  private ativarFadeDeImagens() {
    const marcar = (e: Event) => {
      const el = e.target as HTMLElement;
      if (el instanceof HTMLImageElement && el.hasAttribute('data-fade')) {
        el.classList.add('img-pronta');
      }
    };
    document.addEventListener('load', marcar, true);
    document.addEventListener('error', marcar, true);

    // Imagens que já tinham carregado antes do app iniciar (página pré-renderizada)
    document
      .querySelectorAll<HTMLImageElement>('img[data-fade]')
      .forEach((img) => img.complete && img.classList.add('img-pronta'));
  }
}
