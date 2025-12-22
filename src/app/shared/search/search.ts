import { Component } from '@angular/core';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { Recipes } from '../../model/myrecipes';
import { MyRecipesService } from '../../services/my-recipes';
import { ActivatedRoute } from '@angular/router';
import { FilterDropdown } from '../../category/filter-dropdown/filter-dropdown';
import { CustomButton } from "../custom-button/custom-button";

@Component({
  selector: 'bra-search',
  imports: [RecipeCard, FilterDropdown, CustomButton],
  standalone: true,
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  indice!: number;
  currentPage!: number;

  nomePesquisado: string = '';
  Recipes: Recipes[] = [];

  optionsDropwdown = {
    labelTitle: 'Ordenar Por:',
    items: [
      { name: 'Por nome', checked: true },
      { name: 'Mais novas', checked: false },
      { name: 'Mais antigas', checked: false },
      { name: 'Mais favoritas', checked: false },
    ],
  };

  constructor(
    private route: ActivatedRoute,
    private myRecipesServices: MyRecipesService
  ) {}

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;

    this.route.paramMap.subscribe((params) => {
      const nome = params.get('nome');

      if (nome) {
        this.nomePesquisado = nome;

        this.myRecipesServices.listForSerach(nome).subscribe(
          (res: any) => {
            if (Array.isArray(res)) {
              this.Recipes = res;
            } else {
              this.Recipes = [];
              console.warn('Nenhuma receita encontrada.');
            }
          },
          (error) => {
            console.error('Erro ao carregar receitas:', error);
            this.Recipes = [];
          }
        );
      }
    });
  }

  get myRecipesPage() {
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
