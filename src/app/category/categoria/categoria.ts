import { Component } from '@angular/core';
import { FilterDropdown } from '../filter-dropdown/filter-dropdown';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Recipes } from '../../model/myrecipes';
import { MyRecipesService } from '../../services/my-recipes';
import { CategoriaService } from '../../services/categoria';
import { Categoria as CategoriaModel } from '../../model/categoria'; // 👈 renomeado aqui
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
    items: [] as { id: number; name: string; checked: boolean }[],
  };

  selectedSubcategory: number | null = null;

  indice!: number;
  currentPage!: number;

  categoria?: CategoriaModel;
  Recipes: Recipes[] = [];

  RecipesFiltradas: Recipes[] = [];

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
              this.RecipesFiltradas = res;
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

        // busca os dados da categoria
        this.categoriaService.getCatById(Number(id)).subscribe({
          next: (res: CategoriaModel) => {
            this.categoria = res;

            // limpar antes de preencher
            this.optionsDropwdown2.items = [];

            // adiciona opção "Todas"
            this.optionsDropwdown2.items.push({
              id: 0,
              name: 'Todas',
              checked: true, // começa marcada
            });

            // adiciona subcategorias vindas da API
            this.optionsDropwdown2.items.push(
              ...res.subcategorias.map((s) => ({
                id: s.id,
                name: s.nome,
                checked: false,
              }))
            );
          },
          error: (err) => console.error('Erro ao carregar categoria:', err),
        });
      }
    });
  }

  get RecipesPage() {
    return Array.isArray(this.RecipesFiltradas)
      ? this.RecipesFiltradas.slice(this.indice, this.indice + 6)
      : [];
  }

  get pages(): number {
    return Math.ceil(this.RecipesFiltradas.length / 6);
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

  filtrarPorOrdem(filtro: string) {
    let ordenar = 'nome';

    if (filtro === 'Por nome') ordenar = 'nome';
    if (filtro === 'Mais novas') ordenar = 'mais_novos';
    if (filtro === 'Mais antigas') ordenar = 'mais_antigos';
    if (filtro === 'Mais favoritas') ordenar = 'mais_favoritos';

    // Se estiver filtrando por subcategoria:
    this.buscarReceitas({
      ordenar,
      subcategorias: this.selectedSubcategory ? [this.selectedSubcategory] : [],
    });

    this.resetarPaginacao();
  }

  filtrarPorSubcategoria(id: number) {
    // usuário escolheu "Todas"
    if (id === 0) {
      this.selectedSubcategory = null;

      // marcar "Todas"
      this.optionsDropwdown2.items.forEach((i) => (i.checked = i.id === 0));

      this.buscarReceitas({ subcategorias: [] });
      return;
    }

    // Marca o item correto
    this.optionsDropwdown2.items.forEach((i) => (i.checked = i.id === id));

    this.selectedSubcategory = id;

    this.buscarReceitas({ subcategorias: [id] });
  }

  buscarReceitas(filtros?: any) {
    this.myRecipesServices
      .listCat({ id: this.categoria!.id, nome: this.categoria!.nome }, filtros)
      .subscribe((res) => {
        this.Recipes = res;
        this.RecipesFiltradas = [...res];
        this.resetarPaginacao();
      });
  }

  resetarPaginacao() {
    this.indice = 0;
    this.currentPage = 1;
  }
}
