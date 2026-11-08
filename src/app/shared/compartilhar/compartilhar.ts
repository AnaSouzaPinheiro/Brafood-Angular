import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { ToastService } from '../../services/toast/toast.service';

/**
 * Janela padrão de compartilhar do site (receitas e quadros):
 * link + copiar, WhatsApp e "Mais opções…" (menu nativo do sistema,
 * com as outras redes — só aparece onde o navegador suporta).
 */
@Component({
  selector: 'bra-compartilhar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './compartilhar.html',
  styleUrl: './compartilhar.scss',
})
export class Compartilhar {
  /** Título da janela, ex.: Compartilhar "Bolo de cenoura". */
  @Input() titulo = 'Compartilhar';
  /** Frase que vai junto do link (WhatsApp / menu do sistema). */
  @Input() texto = '';
  @Input({ required: true }) url!: string;
  /** Linha opcional abaixo do link (ex.: "Quem tiver o link pode ver…"). */
  @Input() explicacao: string | null = null;
  /** Rodapé opcional em cinza. */
  @Input() aviso: string | null = null;
  @Output() fechar = new EventEmitter<void>();

  constructor(private toast: ToastService) {}

  @HostListener('document:keydown.escape')
  onEsc() {
    this.fechar.emit();
  }

  get temMenuNativo(): boolean {
    return typeof navigator !== 'undefined' && typeof navigator.share === 'function';
  }

  copiar() {
    const ok = () => this.toast.show('Link copiado!', 'success');
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(this.url).then(ok, () => this.copiarAntigo(ok));
    } else {
      this.copiarAntigo(ok);
    }
  }

  /** Fallback para navegadores sem Clipboard API. */
  private copiarAntigo(ok: () => void) {
    const t = document.createElement('textarea');
    t.value = this.url;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    document.body.removeChild(t);
    ok();
  }

  whatsapp() {
    const msg = this.texto ? `${this.texto} ${this.url}` : this.url;
    window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank', 'noopener');
  }

  maisOpcoes() {
    navigator
      .share({ title: this.titulo, text: this.texto, url: this.url })
      .catch(() => {
        /* usuária cancelou: nada a fazer */
      });
  }
}
