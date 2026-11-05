import { CommonModule } from '@angular/common';
import { Component, afterNextRender, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'bra-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss',
})
export class CookieBanner {
  // Signals: alterados dentro do afterNextRender, precisam avisar a view
  accepted = signal(false);
  loaded = signal(false);

  private storage = inject(StorageService);

  constructor() {
    // Só decide se mostra o banner no NAVEGADOR, depois da hidratação.
    // Antes isso rodava também no prerender (sem localStorage), então o
    // banner ficava "assado" no HTML estático de /home, /login etc. e,
    // se a hidratação não casasse, sobrava um banner morto na tela que
    // não respondia ao clique — mesmo para quem já tinha aceitado.
    afterNextRender(() => {
      try {
        this.accepted.set(this.storage.getItem('cookiesAccepted') === 'true');
      } catch {
        this.accepted.set(false);
      }
      this.loaded.set(true);
    });
  }

  accept(): void {
    // A UI precisa fechar o banner independente do storage funcionar —
    // em aba anônima ou com bloqueio de terceiros o localStorage pode
    // lançar erro, e antes isso travava o accept() antes de marcar
    // accepted = true.
    this.accepted.set(true);

    try {
      this.storage.setItem('cookiesAccepted', 'true');
    } catch {
      // Sem storage disponível: o banner some agora, mas vai voltar a
      // aparecer no próximo carregamento — comportamento aceitável.
    }
  }
}