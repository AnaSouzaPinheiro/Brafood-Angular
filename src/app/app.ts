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
import { ModalFeedback } from "./shared/modal-feedback/modal-feedback";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    Navbar,
    CategoryBar,
    Footer,
    Credit,
    RouterModule,
    ModalFeedback
],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  showLayout = true;
  isBrowser = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Detecta se está no browser
    this.isBrowser = isPlatformBrowser(this.platformId);

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
}
