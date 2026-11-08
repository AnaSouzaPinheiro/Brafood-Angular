import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable, forkJoin, of } from 'rxjs';
import { QuadroService } from '../../services/quadro/quadro.service';
import { ToastService } from '../../services/toast/toast.service';

export interface QuadroEditado {
  nome: string;
  descricao: string | null;
  publico: boolean;
  token: string | null;
}

/** Janela de edição do quadro: nome, descrição e visibilidade. */
@Component({
  selector: 'bra-editar-quadro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './editar-quadro.html',
  styleUrl: './editar-quadro.scss',
})
export class EditarQuadro implements OnInit {
  @Input({ required: true }) idQuadro!: number;
  @Input() nome = '';
  @Input() descricao: string | null = null;
  @Input() publico = false;
  @Input() token: string | null = null;
  @Output() salvo = new EventEmitter<QuadroEditado>();
  @Output() fechar = new EventEmitter<void>();

  nomeEdit = '';
  descricaoEdit = '';
  publicoEdit = false;
  salvando = false;

  constructor(
    private quadroService: QuadroService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.nomeEdit = this.nome;
    this.descricaoEdit = this.descricao ?? '';
    this.publicoEdit = this.publico;
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.fechar.emit();
  }

  salvar() {
    const nome = this.nomeEdit.trim();
    if (!nome || this.salvando) return;
    const descricao = this.descricaoEdit.trim() || null;
    this.salvando = true;

    const textoMudou = nome !== this.nome || descricao !== this.descricao;
    const visibilidadeMudou = this.publicoEdit !== this.publico;

    const texto$: Observable<unknown> = textoMudou
      ? this.quadroService.editar(this.idQuadro, nome, descricao)
      : of(null);
    const visibilidade$: Observable<{ token?: string } | null> = visibilidadeMudou
      ? this.quadroService.definirPublico(this.idQuadro, this.publicoEdit)
      : of(null);

    forkJoin([texto$, visibilidade$]).subscribe({
      next: ([, vis]) => {
        this.salvando = false;
        this.salvo.emit({
          nome,
          descricao,
          publico: this.publicoEdit,
          token: vis?.token ?? this.token,
        });
      },
      error: (err) => {
        this.salvando = false;
        this.toast.show(err?.error?.error ?? 'Erro ao salvar', 'error');
      },
    });
  }
}
