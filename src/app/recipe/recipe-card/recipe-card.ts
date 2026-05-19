import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RecipeResume } from '../recipe-resume/recipe-resume';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSlug } from '../../utils/slug';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';

@Component({
  selector: 'bra-recipe-card',
  standalone: true,
  imports: [RecipeResume, RouterModule, CommonModule, MediaUrlPipe],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard {
  @Output() editar = new EventEmitter<any>();

  @Input() myRecipe: boolean = false;
  @Input() selectedSubcategories!: number[];
  @Input() recipe!: any;
  @Input() cardExibir: 'categoria' | 'subcategoria' = 'categoria';

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

    // Se houver filtro de subcategoria, pega a primeira que a receita possui
    if (this.selectedSubcategories && this.selectedSubcategories.length > 0) {
      chosenSub =
        subs.find((s: any) =>
          this.selectedSubcategories.includes(Number(s.id)),
        ) || null;
    }

    // Se não houver filtro ou não encontrou nenhuma do filtro, pega a primeira subcategoria da receita
    if (!chosenSub && subs.length > 0) {
      chosenSub = subs[0];
    }

    this.mappedRecipe = {
      category: this.recipe.categoria
        ? this.recipe.categoria.split(',')[0].trim()
        : null,
      subcategory: chosenSub
        ? chosenSub.nome
        : (this.recipe.subcategoria ?? null), // fallback para campo direto (modo aleatório)
      img: this.recipe.imagem1,
      url: `/receita/${toSlug(this.recipe.titulo)}/${this.recipe.id}`,
      resume: {
        title: this.recipe.titulo,
        qtdFav: Number(this.recipe.qtd_fav),
        text: this.recipe.resumo,
      },
    };
  }

  /** Label exibido no topo do card conforme configuração da seção */
  get labelDoCard(): string | null {
    if (!this.mappedRecipe) return null;

    if (this.cardExibir === 'subcategoria') {
      return this.mappedRecipe.subcategory ?? this.mappedRecipe.category ?? null;
    }

    return this.mappedRecipe.category ?? null;
  }

  @Output() excluir = new EventEmitter<number>();

  onEditar(event: Event) {
    event.stopPropagation();
    this.editar.emit(this.recipe);
  }

  onExcluir(event: Event) {
    event.stopPropagation();
    this.excluir.emit(this.recipe.id);
  }
}