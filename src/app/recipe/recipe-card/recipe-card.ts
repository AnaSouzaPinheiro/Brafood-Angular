import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecipeResume } from '../recipe-resume/recipe-resume';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-recipe-card',
  standalone: true,
  imports: [RecipeResume, RouterModule, CommonModule],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard {
  @Input() myRecipe: boolean = false;
  @Input() selectedSubcategories!: number[];
  @Input() recipe!: any;
  mappedRecipe: any;
  imgBroken: boolean = false;

  ngOnChanges() {
    if (!this.recipe) return;
    this.imgBroken = false;

    // Garantir que subs seja array de objetos
    let subs: any[] = [];
    if (Array.isArray(this.recipe.subcategorias)) {
      subs = this.recipe.subcategorias;
    } else if (typeof this.recipe.subcategorias === 'string') {
      try {
        subs = JSON.parse(this.recipe.subcategorias);
      } catch (e) {
        console.warn('Erro ao parsear subcategorias:', e);
        subs = [];
      }
    }

    let chosenSub: any = null;

    // 1️⃣ Se houver filtro de subcategoria, pega a primeira que a receita possui
    if (this.selectedSubcategories && this.selectedSubcategories.length > 0) {
      chosenSub =
        subs.find((s: any) =>
          this.selectedSubcategories.includes(Number(s.id)),
        ) || null;
    }

    // 2️⃣ Se não houver filtro ou não encontrou nenhuma do filtro, pega a primeira subcategoria da receita
    if (!chosenSub && subs.length > 0) {
      chosenSub = subs[0];
    }

    // 3️⃣ Fallback: se ainda não encontrou, null
    this.mappedRecipe = {
      category: this.recipe.categoria, // categoria principal
      subcategory: chosenSub ? chosenSub.nome : null, // pega apenas o nome da subcategoria
      img: this.recipe.imagem1,
      url: `/receita/${this.recipe.id}`,
      resume: {
        title: this.recipe.titulo,
        qtdFav: Number(this.recipe.qtd_fav),
        text: this.recipe.resumo,
      },
    };
  }

  @Output() editar = new EventEmitter<number>();
  @Output() excluir = new EventEmitter<number>();

  onEditar(event: Event) {
    event.stopPropagation();
    this.editar.emit(this.recipe.id);
  }

  onExcluir(event: Event) {
    event.stopPropagation();
    this.excluir.emit(this.recipe.id);
  }
}
