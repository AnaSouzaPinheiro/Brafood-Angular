import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { QuadroResumo } from '../../services/quadro/quadro.service';

/**
 * Janelinha para escolher um quadro de destino (adicionar / mover),
 * com opção de criar um quadro novo na hora.
 */
@Component({
  selector: 'bra-escolher-quadro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './escolher-quadro.html',
  styleUrl: './escolher-quadro.scss',
})
export class EscolherQuadro {
  @Input() titulo = 'Escolher quadro';
  @Input() quadros: QuadroResumo[] = [];
  /** Emite o id do quadro escolhido. */
  @Output() escolher = new EventEmitter<number>();
  /** Emite o nome de um quadro novo a ser criado. */
  @Output() criar = new EventEmitter<string>();
  @Output() cancelar = new EventEmitter<void>();

  criando = false;
  novoNome = '';

  @HostListener('document:keydown.escape')
  onEsc() {
    this.cancelar.emit();
  }

  confirmarNovo() {
    const nome = this.novoNome.trim();
    if (nome) this.criar.emit(nome);
  }
}
