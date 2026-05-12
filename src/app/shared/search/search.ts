import { Component } from '@angular/core';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { Recipes } from '../../model/myrecipes';
import { ReceitaService } from '../../services/receita/receita.service';
import { ActivatedRoute } from '@angular/router';
import { FilterDropdown } from '../../category/filter-dropdown/filter-dropdown';
import { CustomButton } from '../custom-button/custom-button';

@Component({
  selector: 'bra-search',
  imports: [RecipeCard, FilterDropdown, CustomButton],
  standalone: true,
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  nomePesquisado: string = '';

  Recipes: Recipes[] = [];
  RecipesFiltradas: Recipes[] = [];

  begin = 0;
  end = 8;

  constructor(
    private route: ActivatedRoute,
    private ReceitaService: ReceitaService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const nome = params.get('nome');

      if (!nome) return;

      this.nomePesquisado = nome;

      this.ReceitaService.listForSerach(nome).subscribe(
        (res: any) => {
          if (Array.isArray(res)) {
            this.Recipes = res;

            const categoriasUnicas = [
              ...new Set(res.map((r: any) => r.categoria)),
            ];

            this.optionsDropwdown2.items = [
              { id: 0, name: 'Todas', checked: true },

              ...categoriasUnicas.map((categoria, index) => ({
                id: index + 1,
                name: categoria,
                checked: false,
              })),
            ];

            this.buscarReceitas();
          } else {
            this.Recipes = [];
            this.RecipesFiltradas = [];
          }
        },
        (error) => {
          console.error('Erro ao carregar receitas:', error);

          this.Recipes = [];
          this.RecipesFiltradas = [];
        },
      );
    });
  }

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
    labelTitle: 'Categorias:',
    items: [] as { id: number; name: string; checked: boolean }[],
  };

  filtros = {
    ordenar: 'nome',
    categorias: [] as string[],
  };

  private mapaOrdenacao: Record<string, string> = {
    'Por nome': 'nome',
    'Mais novas': 'mais_novos',
    'Mais antigas': 'mais_antigos',
    'Mais favoritas': 'mais_favoritos',
  };

  filtrarPorOrdem(filtro: string) {
    this.filtros.ordenar = this.mapaOrdenacao[filtro] ?? 'nome';
    this.buscarReceitas();
  }

  filtrarPorCategoria(ids: number[]) {
    const categoriasSelecionadas = this.optionsDropwdown2.items
      .filter((item) => ids.includes(item.id))
      .map((item) => item.name);

    this.filtros.categorias = categoriasSelecionadas.filter(
      (nome) => nome !== 'Todas',
    );

    this.buscarReceitas();
  }

  buscarReceitas() {
    let receitas = [...this.Recipes];

    // filtro categoria
    if (this.filtros.categorias.length > 0)
      receitas = receitas.filter((r: any) =>
        this.filtros.categorias.includes(r.categoria),
      );

    // ordenação
    switch (this.filtros.ordenar) {
      case 'nome':
        receitas.sort((a: any, b: any) => a.titulo.localeCompare(b.titulo));
        break;

      case 'mais_novos':
        receitas.sort((a: any, b: any) => b.id - a.id);
        break;

      case 'mais_antigos':
        receitas.sort((a: any, b: any) => a.id - b.id);
        break;

      case 'mais_favoritos':
        receitas.sort((a: any, b: any) => b.qtd_fav - a.qtd_fav);
        break;
    }

    this.RecipesFiltradas = receitas;

    this.begin = 0;
    this.end = 8;
  }

  limparFiltros() {
    this.filtros = {
      ordenar: 'nome',
      categorias: [],
    };

    // reset ordenação
    this.optionsDropwdown.items.forEach((i, idx) => (i.checked = idx === 0));

    // reset subcategorias
    this.optionsDropwdown2.items.forEach((i) => {
      i.checked = i.id === 0;
    });

    this.buscarReceitas();
  }

  get RecipesPage() {
    return this.RecipesFiltradas.slice(this.begin, this.end);
  }

  verMais() {
    this.end += 8;
  }
}
