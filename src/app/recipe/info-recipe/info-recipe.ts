import { Component, Input } from '@angular/core';
import { NgFor } from '@angular/common';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { HoverThings } from '../hover-things/hover-things';

@Component({
  selector: 'bra-info-recipe',
  standalone: true,
  imports: [NgFor, CustomButton, HoverThings],
  templateUrl: './info-recipe.html',
  styleUrl: './info-recipe.scss',
})
export class InfoRecipe {
  @Input() recipe!: any;

  get mappedInfoRecipe() {
    return {
      titulo: this.recipe?.titulo,
      categoria: [ this.recipe?.categoria ],
      dificuldade: this.recipe?.dificuldade,
      tempo_hora: this.recipe?.tempo_hora,
      tempo_min: this.recipe?.tempo_min,
      tipo_tempo: this.recipe?.tipo_tempo,
      porcoes: this.recipe?.porcoes,
      tipo_porcao: this.recipe?.tipo_porcao,
    };
  }

  getDifficultyImage(level: number): string {
    const paths: Record<number, string> = {
      1: 'assets/imagens/icones/nivel1.png',
      2: 'assets/imagens/icones/nivel2.png',
      3: 'assets/imagens/icones/nivel3.png',
    };
    return paths[level] || paths[1];
  }

  isFavorite = false;

  toggleFavorite() {
    this.isFavorite = !this.isFavorite;
  }
}
