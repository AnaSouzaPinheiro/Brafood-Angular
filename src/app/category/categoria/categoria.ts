import { Component } from '@angular/core';
import { FilterDropdown } from '../filter-dropdown/filter-dropdown';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Recipes } from '../../model/myrecipes';
import { MyRecipesService } from '../../services/my-recipes';
import { CategoriaService } from '../../services/categoria';
import { Categoria as CategoriaModel } from '../../model/categoria';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { ChangeDetectorRef } from '@angular/core';
import { take } from 'rxjs/operators';

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

  filtros = {
    ordenar: 'nome',
    subcategorias: [] as number[], // vazio = Todas
  };

  categoria?: CategoriaModel;

  Recipes: Recipes[] = [];
  RecipesFiltradas: Recipes[] = [];

  begin = 0;
  end = 6;

  constructor(
    private route: ActivatedRoute,
    private myRecipesServices: MyRecipesService,
    private categoriaService: CategoriaService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          const nome = params.get('nome');

          if (!id || !nome) throw new Error('Categoria inválida');

          return this.categoriaService.getCatById(Number(id));
        }),
      )
      .subscribe((categoria) => {
        this.categoria = categoria;

        this.optionsDropwdown2.items = [
          { id: 0, name: 'Todas', checked: true },
          ...categoria.subcategorias.map((s) => ({
            id: s.id,
            name: s.nome,
            checked: false,
          })),
        ];

        this.buscarReceitas();
      });
  }

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

  filtrarPorSubcategoria(ids: number[]) {
    this.filtros.subcategorias = ids;
    this.buscarReceitas();
  }

  buscarReceitas() {
    if (!this.categoria) return;

    const filtrosRequest: any = {
      ordenar: this.filtros.ordenar,
    };

    // Apenas adicione 'subcategorias' se houver IDs específicas para filtrar (não vazio/não "Todas")
    if (this.filtros.subcategorias.length > 0) {
      filtrosRequest.subcategorias = this.filtros.subcategorias;
    }

    // Log do request final para debug (opcional)
    // console.log(
    //   `Enviando request com filtros:`,
    //   filtrosRequest,
    //   `(length: ${this.filtros.subcategorias.length})`,
    // );

    this.myRecipesServices
      .listCat(
        { id: this.categoria.id, slug: this.categoria.slug },
        filtrosRequest,
      )
      .subscribe((res) => {
        this.Recipes = res;
        this.RecipesFiltradas = [...res];
        this.begin = 0;
        this.end = 6;
      });
  }

  get RecipesPage() {
    return this.RecipesFiltradas.slice(this.begin, this.end);
  }

  verMais() {
    this.end += 6;
  }

  limparFiltros() {
    this.filtros = {
      ordenar: 'nome',
      subcategorias: [],
    };

    // Reseta o dropdown de Ordenação para "Por nome"
    this.optionsDropwdown.items.forEach((i, idx) => (i.checked = idx === 0));

    // Reseta o dropdown de Subcategorias para "Todas"
    this.optionsDropwdown2.items.forEach((i) => {
      i.checked = i.id === 0;
    });

    this.buscarReceitas();
  }
}
