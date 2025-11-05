import { Component, Input } from '@angular/core';
import { RecipeResume } from '../recipe-resume/recipe-resume';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'bra-recipe-card',
  standalone: true,
  imports: [RecipeResume, RouterModule],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard {
  @Input() myRecipe: boolean = false;

  @Input() recipe!: any;

  get mappedRecipe() {
    return {
      category: this.recipe.categoria,
      img: this.recipe.imagem1,
      url: `/receita/${this.recipe.id}`,
      resume: {
          title: this.recipe.titulo,
          qtdFav: Number(this.recipe.qtd_fav),
          text: this.recipe.resumo,
      },
    };
  }
}
