import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { StorageService } from '../../services/storage/storage.service';

@Component({
  selector: 'bra-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss',
})
export class CookieBanner implements OnInit {
  accepted = false;
  loaded = false;

  private storage = inject(StorageService);

  ngOnInit(): void {
    this.accepted = this.storage.getItem('cookiesAccepted') === 'true';
    this.loaded = true;
  }

  accept(): void {
    // A UI precisa fechar o banner independente do storage funcionar —
    // em aba anônima ou com bloqueio de terceiros o localStorage pode
    // lançar erro, e antes isso travava o accept() antes de marcar
    // accepted = true.
    this.accepted = true;

    try {
      this.storage.setItem('cookiesAccepted', 'true');
    } catch {
      // Sem storage disponível: o banner some agora, mas vai voltar a
      // aparecer no próximo carregamento — comportamento aceitável.
    }
  }
}