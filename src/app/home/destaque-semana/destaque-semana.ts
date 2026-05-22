import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { ReceitaDestaque } from '../../services/destaque/destaque.service';
import { toSlug } from '../../utils/slug';

@Component({
  selector: 'bra-destaque-semana',
  standalone: true,
  imports: [CommonModule, RouterModule, MediaUrlPipe],
  templateUrl: './destaque-semana.html',
  styleUrl: './destaque-semana.scss',
})
export class DestaqueSemana implements OnChanges {
  @Input() recipe!: ReceitaDestaque;

  url = '';
  estrelas: boolean[] = [];

  ngOnChanges() {
    if (!this.recipe) return;
    this.url = `/receita/${toSlug(this.recipe.titulo)}/${this.recipe.id}`;
    this.estrelas = this.calcularEstrelas(this.recipe.media_avaliacao);
  }

  private calcularEstrelas(media: number | null): boolean[] {
    if (!media) return [];
    return [1, 2, 3, 4, 5].map((n) => n <= Math.round(media));
  }

  get categoriaLabel(): string {
    const parts = [this.recipe.categoria, this.recipe.subcategoria].filter(Boolean);
    return parts.join(' · ');
  }

  get favLabel(): string {
    const n = Number(this.recipe.qtd_fav ?? 0);
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  }
}
