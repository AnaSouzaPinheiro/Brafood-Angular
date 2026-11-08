import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { QuadroResumo, QuadroService } from '../../services/quadro/quadro.service';
import { ToastService } from '../../services/toast/toast.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { Perfil } from '../perfil/perfil';

/** Área "Salvas": mosaicos com o quadro fixo Favoritos + quadros do usuário. */
@Component({
  selector: 'bra-favoritas',
  standalone: true,
  imports: [Perfil, RouterModule, CommonModule, FormsModule, MediaUrlPipe],
  templateUrl: './favoritas.html',
  styleUrl: './favoritas.scss',
})
export class Favoritas implements OnInit {
  carregando = true;
  favoritos = { total: 0, capas: [] as string[] };
  quadros: QuadroResumo[] = [];

  criando = false;
  novoNome = '';
  novaDescricao = '';
  salvando = false;

  constructor(
    private quadroService: QuadroService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    this.carregar();
  }

  carregar() {
    this.quadroService.listar().subscribe({
      next: (res) => {
        this.favoritos = res.favoritos;
        this.quadros = res.quadros;
        this.carregando = false;
      },
      error: () => (this.carregando = false),
    });
  }

  /** Sempre 4 posições no mosaico (vazias viram blocos de cor). */
  mosaico(capas: string[]): (string | null)[] {
    return [0, 1, 2, 3].map((i) => capas[i] ?? null);
  }

  criarQuadro() {
    const nome = this.novoNome.trim();
    if (!nome || this.salvando) return;
    this.salvando = true;

    this.quadroService.criar(nome, this.novaDescricao.trim() || null).subscribe({
      next: () => {
        this.salvando = false;
        this.criando = false;
        this.novoNome = '';
        this.novaDescricao = '';
        this.toast.show('Quadro criado!', 'success');
        this.carregar();
      },
      error: (err) => {
        this.salvando = false;
        this.toast.show(err?.error?.error ?? 'Erro ao criar quadro', 'error');
      },
    });
  }
}
