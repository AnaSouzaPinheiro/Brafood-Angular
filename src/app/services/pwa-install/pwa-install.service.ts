import { Injectable, NgZone, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ToastService } from '../toast/toast.service';
import { StorageService } from '../storage/storage.service';

const CHAVE_INSTALADO = 'pwaInstalado';

/**
 * Controla a opção "Instalar aplicativo".
 * - Chrome/Edge/Android: guarda o evento beforeinstallprompt e abre o prompt nativo.
 * - iOS (Safari): não existe prompt; mostramos a instrução "Compartilhar → Adicionar à Tela de Início".
 * - Se o app já estiver instalado, a opção some. Sinais usados:
 *   1. rodando como app (display-mode: standalone);
 *   2. navigator.getInstalledRelatedApps() (Chrome/Edge, quando disponível);
 *   3. o evento appinstalled, lembrado no localStorage deste navegador.
 *   O lembrete (3) é apagado se o navegador voltar a oferecer a instalação
 *   (beforeinstallprompt), o que acontece quando o app foi desinstalado.
 * - No iOS não há como saber, de dentro do Safari, se o app foi adicionado à
 *   Tela de Início; por isso a opção continua aparecendo lá fora do app.
 */
@Injectable({ providedIn: 'root' })
export class PwaInstallService {
  private zone = inject(NgZone);
  private toast = inject(ToastService);
  private storage = inject(StorageService);

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
    // Já instalou neste navegador (evento appinstalled numa visita anterior)?
    const lembrado = this.storage.getItem(CHAVE_INSTALADO) === 'true';
    this.instalado.set(standalone || lembrado);
    if (standalone) this.storage.setItem(CHAVE_INSTALADO, 'true');

    // Chrome/Edge: pergunta ao navegador se este app está instalado
    this.verificarAppsInstalados();

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
        // Se o navegador oferece instalar, o app NÃO está instalado
        // (ex.: foi desinstalado depois do lembrete antigo)
        this.storage.removeItem(CHAVE_INSTALADO);
        this.instalado.set(false);
      });
    });

    window.addEventListener('appinstalled', () => {
      this.zone.run(() => {
        this.deferredPrompt = null;
        this.podePrompt.set(false);
        this.instalado.set(true);
        this.storage.setItem(CHAVE_INSTALADO, 'true');
      });
    });
  }

  private async verificarAppsInstalados(): Promise<void> {
    const nav = navigator as any;
    if (typeof nav.getInstalledRelatedApps !== 'function') return;
    try {
      const apps: unknown[] = await nav.getInstalledRelatedApps();
      if (apps.length > 0) {
        this.zone.run(() => {
          this.instalado.set(true);
          this.storage.setItem(CHAVE_INSTALADO, 'true');
        });
      }
    } catch {
      // API indisponível ou bloqueada: segue só com os outros sinais
    }
  }

  async instalar(): Promise<void> {
    if (this.deferredPrompt) {
      const prompt = this.deferredPrompt;
      this.deferredPrompt = null; // o evento só pode ser usado uma vez
      this.podePrompt.set(false);
      prompt.prompt();
      const { outcome } = await prompt.userChoice;
      if (outcome === 'accepted') {
        this.instalado.set(true);
        this.storage.setItem(CHAVE_INSTALADO, 'true');
      }
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
