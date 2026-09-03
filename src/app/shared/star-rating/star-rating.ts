import { CommonModule } from '@angular/common';
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    Output,
} from '@angular/core';

@Component({
  selector: 'bra-star-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './star-rating.html',
  styleUrl: './star-rating.scss',
})
export class StarRating implements OnChanges {
  /** Nota atual do usuário (null = não avaliou) */
  @Input() notaUsuario: number | null = null;
  /** Média geral da receita */
  @Input() media: number | null = null;
  /** Total de avaliações */
  @Input() total: number = 0;
  /** Emite a nota escolhida (null = remover avaliação) */
  @Output() avaliar = new EventEmitter<number | null>();
  /** Se false, exibe só a média (somente leitura) */
  @Input() interativo: boolean = true;
  /** Quando true, estrelas vazias ficam vermelhas (validação) */
  @Input() erro: boolean = false;

  @Input() exibirResumo = true;

  estrelas = [1, 2, 3, 4, 5];
  hover: number | null = null;

  ngOnChanges() {}

  get notaAtiva(): number {
    // No modo leitura, preenche as estrelas com base na média
    if (!this.interativo) {
      return this.hover ?? this.media ?? 0;
    }
    return this.hover ?? this.notaUsuario ?? 0;
  }

  onHover(n: number) {
    if (!this.interativo) return;
    this.hover = n;
  }

  onLeave() {
    this.hover = null;
  }

  onClick(n: number) {
    if (!this.interativo) return;
    // Clique na mesma nota = remover avaliação
    if (this.notaUsuario === n) {
      this.avaliar.emit(null);
    } else {
      this.avaliar.emit(n);
    }
  }

  /** Largura do preenchimento para a média (0–100%) */
  get mediaFill(): number {
    if (!this.media) return 0;
    return (this.media / 5) * 100;
  }
}
