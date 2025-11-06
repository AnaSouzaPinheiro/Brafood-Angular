import { Component } from '@angular/core';
import { FilterDropdown } from '../filter-dropdown/filter-dropdown';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Recipes } from '../../recipe/model/myrecipes';
import { MyRecipesService } from '../../recipe/services/my-recipes';
import { CategoriaService } from '../../core/services/categoria';
import { Categoria as CategoriaModel } from '../../core/model/categoria'; // 👈 renomeado aqui
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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
    labelTitle: 'Subcategorias:',
    items: [] as { name: string; checked: boolean }[],
  };

  indice!: number;
  currentPage!: number;

  categoria?: CategoriaModel; // 👈 usando o novo nome
  Recipes: Recipes[] = [];

  constructor(
    private route: ActivatedRoute,
    private myRecipesServices: MyRecipesService,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      const nome = params.get('nome');

      if (id && nome) {
        this.myRecipesServices.listCat({ id: Number(id), nome }).subscribe(
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

        // 🔹 busca os dados da categoria
        this.categoriaService.getCatById(Number(id)).subscribe({
          next: (res: CategoriaModel) => {
            this.categoria = res;

            this.optionsDropwdown2.items = res.subcategorias.map((s) => ({
              name: s.nome,
              checked: s.nome.toLowerCase() === 'todas', // 🔹 marca "Todas" como default
            }));
          },
          error: (err) => console.error('Erro ao carregar categoria:', err),
        });
      }
    });
  }

  get RecipesPage() {
    return Array.isArray(this.Recipes)
      ? this.Recipes.slice(this.indice, this.indice + 6)
      : [];
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
