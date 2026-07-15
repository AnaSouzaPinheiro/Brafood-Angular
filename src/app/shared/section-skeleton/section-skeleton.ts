import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'bra-section-skeleton',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './section-skeleton.html',
  styleUrl: './section-skeleton.scss',
})
export class SectionSkeleton {
  /** Quantos cards mostrar no placeholder */
  @Input() cardCount = 4;

  get cards(): number[] {
    return Array.from({ length: this.cardCount }, (_, i) => i);
  }
}
