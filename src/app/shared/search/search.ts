import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { LoggerService } from '../../services/logger/logger.service';
import { CustomButton } from '../custom-button/custom-button';
import {
    DropdownDinamicoItem,
    FilterPanel,
} from '../filter-panel/filter-panel';
import { RecipeCardSkeleton } from '../recipe-card-skeleton/recipe-card-skeleton';

import {
    FilterStateService,
    FiltroState,
} from '../../services/filter/filter-state.service';
import { ReceitaService } from '../../services/receita/receita.service';

import { Recipes } from '../../model/myrecipes';

@Component({
  selector: 'bra-search',
  standalone: true,
  imports: [CommonModule, FilterPanel, CustomButton, RecipeCard, RecipeCardSkeleton],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {
  nomePesquisado = '';

  Recipes: Recipes[] = [];
  RecipesFiltradas: Recipes[] = [];
  loadingSearch = true;

  begin = 0;
  end = 8;

  filtros!: FiltroState;

  // Dropdown dinâmico de categorias encontradas na busca
  categoriaItems: DropdownDinamicoItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private receitaService: ReceitaService,
    private filterService: FilterStateService,
    private logger: LoggerService,
  ) {
    this.filtros = this.filterService.filtroInicial();
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const nome = params.get('nome');
      if (!nome) {
        this.loadingSearch = false;
        return;
      }

      this.nomePesquisado = nome;

      this.receitaService.listForSerach(nome).subscribe({
        next: (res: any) => {
          if (!Array.isArray(res)) {
            this.Recipes = [];
            this.RecipesFiltradas = [];
            this.loadingSearch = false;
            return;
          }

          this.Recipes = res;

          const categoriasUnicas = [
            ...new Set(res.map((r: any) => r.categoria)),
          ];
          this.categoriaItems = [
            { id: 0, name: 'Todas', checked: true },
            ...categoriasUnicas.map((cat, idx) => ({
              id: idx + 1,
              name: cat as string,
              checked: false,
            })),
          ];

          this.aplicarFiltros();
          this.loadingSearch = false;
        },
        error: (err) => {
          this.logger.error('Erro ao carregar receitas:', err);
          this.Recipes = [];
          this.RecipesFiltradas = [];
          this.loadingSearch = false;
        },
      });
    });
  }

  onFiltrosChange(filtros: FiltroState) {
    this.filtros = filtros;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.RecipesFiltradas = this.filterService.aplicarFiltrosFrontend(
      this.Recipes,
      this.filtros,
    );
    this.begin = 0;
    this.end = 8;
  }

  get RecipesPage() {
    return this.RecipesFiltradas.slice(this.begin, this.end);
  }

  verMais() {
    this.end += 8;
  }
}