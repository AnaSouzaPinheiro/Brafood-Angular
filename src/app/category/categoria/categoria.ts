import { Component } from '@angular/core';
import { FilterDropdown } from '../filter-dropdown/filter-dropdown';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Recipes } from '../../recipe/model/myrecipes';
import { MyRecipesService } from '../../recipe/services/my-recipes';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-categoria',
  standalone: true,
  imports: [FilterDropdown, CustomButton, RecipeCard, CommonModule],
  templateUrl: './categoria.html',
  styleUrl: './categoria.scss',
})
export class Categoria {
  optionsDropwdown = {
    labelTitle: 'Ordenar Por:',
    items: [
      { name: 'Por nome', checked: true },
      { name: 'Mais novas', checked: false },
      { name: 'Mais antigas', checked: false },
      { name: 'Mais favoritas', checked: false },
    ],
  };

  optionsDropwdown2 = {
    labelTitle: 'Subcategorias: ',
    items: [
      { name: 'Cafés & Chás', checked: true },
      { name: 'Drinks & Coquetéis', checked: false },
      { name: 'Sem Álcool', checked: false },
    ],
  };

  indice!: number;
  currentPage!: number;

  Recipes: Recipes[] = [];

  //myRecipesServices: MyRecipes;

  constructor(private myRecipesServices: MyRecipesService) {
    // this.myRecipesServices = new MyRecipes();
    // this.myRecipes$ = this.myRecipesServices.list();

    this.myRecipesServices.list().subscribe((data) => {
      this.Recipes = data;
    });
  }

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;
  }

  get RecipesPage() {
    return this.Recipes.slice(this.indice, this.indice + 6);
  }

  get pages(): number {
    return Math.ceil(this.Recipes.length / 6);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }

  nextPage() {
    let newIndex = this.indice + 6;
    if (newIndex >= this.Recipes.length) {
      newIndex = 0;
    }
    this.indice = newIndex;
    this.currentPage = this.indice / 6 + 1;
  }

  prevPage() {
    let newIndex = this.indice - 6;
    if (newIndex < 0) {
      newIndex = (this.pages - 1) * 6;
    }
    this.indice = newIndex;
    this.currentPage = this.indice / 6 + 1;
  }

  goToPage(page: number) {
    this.indice = (page - 1) * 6;
    this.currentPage = page;
  }
}
