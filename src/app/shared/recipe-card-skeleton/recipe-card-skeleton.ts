import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'bra-recipe-card-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-card-skeleton.html',
  styleUrl: './recipe-card-skeleton.scss',
})
export class RecipeCardSkeleton {
  /** Quantos cards de placeholder mostrar no grid */
  @Input() count = 8;

  get cards(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
