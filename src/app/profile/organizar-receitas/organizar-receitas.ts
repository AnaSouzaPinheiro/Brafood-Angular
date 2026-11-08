import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { QuadroService } from '../../services/quadro/quadro.service';
import { ToastService } from '../../services/toast/toast.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';

/** Arrastar para reordenar as receitas de um quadro (mouse e toque). */
@Component({
  selector: 'bra-organizar-receitas',
  standalone: true,
  imports: [CommonModule, CdkDropList, CdkDrag, MediaUrlPipe],
  templateUrl: './organizar-receitas.html',
  styleUrl: './organizar-receitas.scss',
})
export class OrganizarReceitas implements OnInit {
  @Input({ required: true }) idQuadro!: number;
  @Input() receitas: any[] = [];
  /** Emite a nova ordem (ids) depois de salvar. */
  @Output() salvo = new EventEmitter<number[]>();
  @Output() fechar = new EventEmitter<void>();

  itens: any[] = [];
  salvando = false;
  mudou = false;

  constructor(
    private quadroService: QuadroService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.itens = [...this.receitas];
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.fechar.emit();
  }

  soltar(ev: CdkDragDrop<any[]>) {
    if (ev.previousIndex === ev.currentIndex) return;
    moveItemInArray(this.itens, ev.previousIndex, ev.currentIndex);
    this.mudou = true;
  }

  /** Alternativa ao arrastar (teclado / acessibilidade). */
  mover(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= this.itens.length) return;
    moveItemInArray(this.itens, i, j);
    this.mudou = true;
  }

  salvar() {
    if (!this.mudou) {
      this.fechar.emit();
      return;
    }
    this.salvando = true;
    const ids = this.itens.map((r) => Number(r.id));
    this.quadroService.reordenarReceitas(this.idQuadro, ids).subscribe({
      next: () => {
        this.toast.show('Ordem salva', 'success');
        this.salvo.emit(ids);
      },
      error: () => {
        this.salvando = false;
        this.toast.show('Não foi possível salvar a ordem', 'error');
      },
    });
  }
}
