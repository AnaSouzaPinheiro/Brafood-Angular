import { Component } from '@angular/core';
import { FilterDropdown } from '../filter-dropdown/filter-dropdown';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Myrecipes } from '../../profile/minhas-receitas/model/myrecipes';
import { MyRecipesService } from '../../profile/minhas-receitas/services/my-recipes';
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
      { name: 'Mais favoritas', checked: true },
      { name: 'Mais antigas', checked: false },
      { name: 'Mais novas', checked: false },
      { name: 'Por nome', checked: false },
    ],
  };

  optionsDropwdown2 = {
    labelTitle: 'Subctagorias: ',
    items: [
      { name: 'Cafés & Chás', checked: true },
      { name: 'Drinks & Coquetéis', checked: false },
      { name: 'Sem Álcool', checked: false },
    ],
  };

  indice!: number;
  currentPage!: number;

  myRecipes: Myrecipes[] = [];

  //myRecipesServices: MyRecipes;

  constructor(private myRecipesServices: MyRecipesService) {
    // this.myRecipesServices = new MyRecipes();
    // this.myRecipes$ = this.myRecipesServices.list();

    this.myRecipesServices.list().subscribe((data) => {
      this.myRecipes = data;
    });
  }

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;
  }

  get RecipesPage() {
    return this.myRecipes.slice(this.indice, this.indice + 6);
  }

  get pages(): number {
    return Math.ceil(this.myRecipes.length / 6);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }

  nextPage() {
    let newIndex = this.indice + 6;
    if (newIndex >= this.myRecipes.length) {
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
