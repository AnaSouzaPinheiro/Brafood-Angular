import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import {
  FilterPanel,
  DropdownDinamicoItem,
} from '../../shared/filter-panel/filter-panel';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';

import { ReceitaService } from '../../services/receita/receita.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import {
  FilterStateService,
  FiltroState,
} from '../../services/filter/filter-state.service';

import { Recipes } from '../../model/myrecipes';
import { Categoria as CategoriaModel } from '../../model/categoria';

@Component({
  selector: 'bra-categoria',
  standalone: true,
  imports: [FilterPanel, CustomButton, RecipeCard, CommonModule],
  templateUrl: './categoria.html',
  styleUrl: './categoria.scss',
})
export class Categoria {
  categoria?: CategoriaModel;

  Recipes: Recipes[] = [];
  RecipesFiltradas: Recipes[] = [];

  begin = 0;
  end = 8;

  filtros!: FiltroState;

  // Dropdown dinâmico de subcategorias (exclusivo desta página)
  subcategoriaItems: DropdownDinamicoItem[] = [];

  constructor(
    private route: ActivatedRoute,
    private receitaService: ReceitaService,
    private categoriaService: CategoriaService,
    private filterService: FilterStateService,
  ) {
    this.filtros = this.filterService.filtroInicial();
  }

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

        this.subcategoriaItems = [
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

  onFiltrosChange(filtros: FiltroState) {
    this.filtros = filtros;
    this.buscarReceitas();
  }

  buscarReceitas() {
    if (!this.categoria) return;

    const req: any = { ordenar: this.filtros.ordenar };

    if (this.filtros.subcategorias.length)
      req.subcategorias = this.filtros.subcategorias;
    if (this.filtros.dificuldades.length)
      req.dificuldades = this.filtros.dificuldades;
    if (this.filtros.tiposPorcao.length)
      req.tiposPorcao = this.filtros.tiposPorcao;
    if (this.filtros.tempoMax != null) req.tempoMax = this.filtros.tempoMax;

    this.receitaService
      .listCat({ id: this.categoria.id, nome: this.categoria.nome }, req)
      .subscribe((res) => {
        this.Recipes = res;

        // Filtro de tempo mínimo ("Longo") aplicado no frontend
        this.RecipesFiltradas =
          this.filtros.tempoMin != null
            ? res.filter(
                (r) =>
                  (r.tempo_hora ?? 0) * 60 + (r.tempo_min ?? 0) >=
                  this.filtros.tempoMin!,
              )
            : [...res];

        this.begin = 0;
        this.end = 8;
      });
  }

  get RecipesPage() {
    return this.RecipesFiltradas.slice(this.begin, this.end);
  }

  verMais() {
    this.end += 8;
  }
}
