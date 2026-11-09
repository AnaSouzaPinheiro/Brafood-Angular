import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { LoggerService } from '../../services/logger/logger.service';
import { CustomButton } from '../custom-button/custom-button';
import { BarraFiltros, ChipFiltro } from '../barra-filtros/barra-filtros';
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
  imports: [CommonModule, BarraFiltros, CustomButton, RecipeCard, RecipeCardSkeleton],
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

  // Chips com as categorias encontradas na busca
  categoriaChips: ChipFiltro[] = [];
  termoBusca = '';

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
      this.loadingSearch = true;

      this.receitaService.listForSerach(nome).subscribe({
        next: (res: any) => {
          if (!Array.isArray(res)) {
            this.Recipes = [];
            this.RecipesFiltradas = [];
            this.loadingSearch = false;
            return;
          }

          this.Recipes = res;

          // "Comemorativas, Sobremesas" vira dois chips
          const categoriasUnicas = [
            ...new Set(
              res.flatMap((r: any) =>
                String(r.categoria ?? '')
                  .split(',')
                  .map((c) => c.trim())
                  .filter(Boolean),
              ),
            ),
          ].sort((x, y) => (x as string).localeCompare(y as string));
          this.categoriaChips = categoriasUnicas.map((c, i) => ({
            id: i + 1,
            nome: c as string,
          }));
          this.termoBusca = '';
          this.filtros = this.filterService.filtroInicial();

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

  onBuscaChange(valor: string) {
    this.termoBusca = valor;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const termo = this.normalizar(this.termoBusca.trim());
    const base = termo
      ? this.Recipes.filter((r: any) => this.normalizar(r.titulo).includes(termo))
      : this.Recipes;
    this.RecipesFiltradas = this.filterService.aplicarFiltrosFrontend(
      base,
      this.filtros,
    );
    this.begin = 0;
    this.end = 8;
  }

  get RecipesPage() {
    return this.RecipesFiltradas.slice(this.begin, this.end);
  }

  private normalizar(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase();
  }

  verMais() {
    this.end += 8;
  }
}