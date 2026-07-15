import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'bra-recipe-detail-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recipe-detail-skeleton.html',
  styleUrl: './recipe-detail-skeleton.scss',
})
export class RecipeDetailSkeleton {
  readonly ingredientLines = Array.from({ length: 6 });
  readonly preparoLines = Array.from({ length: 4 });
}
