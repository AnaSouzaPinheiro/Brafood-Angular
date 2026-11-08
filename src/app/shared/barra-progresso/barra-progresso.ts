import { isPlatformBrowser } from '@angular/common';
import { Component, DestroyRef, Inject, PLATFORM_ID, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';

/** Só mostra a barra se a navegação demorar mais que isso (evita piscar). */
const ATRASO_MS = 150;

/**
 * Barra fina no topo da tela enquanto uma página está carregando.
 * Sem ela, em conexões lentas o clique parecia não ter funcionado
 * (a URL só muda quando a página termina de baixar).
 */
@Component({
  selector: 'bra-barra-progresso',
  standalone: true,
  template: `
    @if (visivel) {
      <div class="barra" [class.terminando]="terminando" role="progressbar" aria-label="Carregando página">
        <div class="preenchimento"></div>
      </div>
    }
  `,
  styles: `
    .barra {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      z-index: 3000;
      pointer-events: none;
      overflow: hidden;
    }
    .preenchimento {
      height: 100%;
      width: 100%;
      background: #188cff;
      box-shadow: 0 0 6px rgba(24, 140, 255, 0.7);
      transform-origin: left;
      animation: avancar 8s cubic-bezier(0.1, 0.7, 0.2, 1) forwards;
    }
    .terminando .preenchimento {
      animation: none;
      transform: scaleX(1);
      opacity: 0;
      transition: opacity 0.3s ease 0.1s;
    }
    @keyframes avancar {
      from { transform: scaleX(0); }
      to { transform: scaleX(0.9); }
    }
  `,
})
export class BarraProgresso {
  visivel = false;
  terminando = false;

  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor(router: Router, @Inject(PLATFORM_ID) platformId: object) {
    if (!isPlatformBrowser(platformId)) return;
    const destroyRef = inject(DestroyRef);

    router.events.pipe(takeUntilDestroyed(destroyRef)).subscribe((e) => {
      if (e instanceof NavigationStart) {
        this.limparTimer();
        this.terminando = false;
        this.timer = setTimeout(() => (this.visivel = true), ATRASO_MS);
      } else if (
        e instanceof NavigationEnd ||
        e instanceof NavigationCancel ||
        e instanceof NavigationError
      ) {
        this.limparTimer();
        if (this.visivel) {
          this.terminando = true;
          this.timer = setTimeout(() => {
            this.visivel = false;
            this.terminando = false;
          }, 400);
        }
      }
    });
  }

  private limparTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
  }
}
