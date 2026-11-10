import { Injectable, NgZone, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastService } from '../toast/toast.service';

/**
 * Controla a opção "Instalar aplicativo".
 * - Chrome/Edge/Android: guarda o evento beforeinstallprompt e abre o prompt nativo.
 * - iOS (Safari): não existe prompt; mostramos a instrução "Compartilhar → Adicionar à Tela de Início".
 * - Se já estiver rodando como app instalado (standalone), a opção some.
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private zone = inject(NgZone);
  private toast = inject(ToastService);

  private deferredPrompt: any = null;
  private podePrompt = signal(false);
  private instalado = signal(false);
  private ios = false;

  /** true quando faz sentido mostrar "Instalar aplicativo" */
  readonly disponivel = computed(
    () => !this.instalado() && (this.podePrompt() || this.ios),
  );

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    this.instalado.set(standalone);

    const ua = navigator.userAgent;
    // iPadOS se apresenta como Mac, mas com touch
    this.ios =
      /iphone|ipad|ipod/i.test(ua) ||
      (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1);

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault(); // segura o mini-banner; o usuário instala pelo menu
      this.zone.run(() => {
        this.deferredPrompt = e;
        this.podePrompt.set(true);
      });
    });

    window.addEventListener('appinstalled', () => {
      this.zone.run(() => {
        this.deferredPrompt = null;
        this.podePrompt.set(false);
        this.instalado.set(true);
      });
    });
  }

  async instalar(): Promise<void> {
    if (this.deferredPrompt) {
      const prompt = this.deferredPrompt;
      this.deferredPrompt = null; // o evento só pode ser usado uma vez
      this.podePrompt.set(false);
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') this.instalado.set(true);
      return;
    }
    if (this.ios) {
      this.toast.show(
        'Para instalar: toque em Compartilhar e depois em "Adicionar à Tela de Início".',
        'info',
        7000,
      );
    }
  }
}
