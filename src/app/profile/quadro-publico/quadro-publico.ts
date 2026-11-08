import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { QuadroPublico as DadosQuadroPublico, QuadroService } from '../../services/quadro/quadro.service';
import { Compartilhar } from '../../shared/compartilhar/compartilhar';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { RecipeCardSkeleton } from '../../shared/recipe-card-skeleton/recipe-card-skeleton';

/** Quadro compartilhado por link — qualquer pessoa vê, ninguém edita. */
@Component({
  selector: 'bra-quadro-publico',
  standalone: true,
  imports: [CommonModule, RouterModule, RecipeCard, RecipeCardSkeleton, MediaUrlPipe, Compartilhar],
  templateUrl: './quadro-publico.html',
  styleUrl: './quadro-publico.scss',
})
export class QuadroPublicoPage implements OnInit {
  dados: DadosQuadroPublico | null = null;
  carregando = true;
  erro = false;
  compartilharAberto = false;

  get primeiroNome(): string {
    return this.dados?.autor.nome.split(' ')[0] ?? '';
  }

  get linkAtual(): string {
    return typeof window === 'undefined' ? '' : window.location.href;
  }

  constructor(
    private route: ActivatedRoute,
    private quadroService: QuadroService,
    private title: Title,
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;
    const token = this.route.snapshot.paramMap.get('token') ?? '';

    this.quadroService.publico(token).subscribe({
      next: (res) => {
        this.dados = res;
        this.carregando = false;
        this.title.setTitle(`${res.quadro.nome} — quadro de ${res.autor.nome} | BraFood`);
      },
      error: () => {
        this.erro = true;
        this.carregando = false;
      },
    });
  }
}
