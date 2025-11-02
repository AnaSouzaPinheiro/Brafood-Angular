import { Component, Input } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { HoverThings } from '../hover-things/hover-things';

@Component({
  selector: 'bra-info-recipe',
  standalone: true,
  imports: [NgFor, NgClass, CustomButton, HoverThings],
  templateUrl: './info-recipe.html',
  styleUrl: './info-recipe.scss',
})
export class InfoRecipe {
  @Input() recipe = {
    title: 'Pé de moleque',
    categories: ['Festa junina', 'Doces'],
    difficulty: 'one',
    time: 30,
    typeTime: 'min',
    unid: 20,
    typeUnid: 'unidades',
  };

  getDifficultyImage(level: string): string {
    switch (level) {
      case 'one':
        return 'assets/imagens/icones/nivel1.png';
      case 'two':
        return 'assets/imagens/icones/nivel2.png';
      case 'three':
        return 'assets/imagens/icones/nivel3.png';
      default:
        return 'assets/imagens/icones/nivel1.png';
    }
  }

  isFavorite = false;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
}
