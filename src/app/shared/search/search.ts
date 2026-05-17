import { Component } from '@angular/core';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { Recipes } from '../../model/myrecipes';
import { ReceitaService } from '../../services/receita/receita.service';
import { ActivatedRoute } from '@angular/router';
import { FilterDropdown } from '../../category/filter-dropdown/filter-dropdown';
import { CustomButton } from '../custom-button/custom-button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-search',
  imports: [RecipeCard, FilterDropdown, CustomButton, CommonModule],
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

  optionsDificuldade = {
    labelTitle: 'Dificuldade:',
    items: [
      { id: 0, name: 'Todas', checked: true },
      { id: 1, name: 'Fácil', checked: false },
      { id: 2, name: 'Médio', checked: false },
      { id: 3, name: 'Difícil', checked: false },
    ],
  };

  optionsTempo = {
    labelTitle: 'Tempo de preparo:',
    items: [
      { name: 'Qualquer tempo', checked: true, tempoMax: null, tempoMin: null },
      {
        name: 'Rápido (até 30 min)',
        checked: false,
        tempoMax: 30,
        tempoMin: null,
      },
      {
        name: 'Médio (até 1 hora)',
        checked: false,
        tempoMax: 60,
        tempoMin: null,
      },
      {
        name: 'Longo (acima de 1 hora)',
        checked: false,
        tempoMax: null,
        tempoMin: 61,
      },
    ],
  };

  optionsTipoPorcao = {
    labelTitle: 'Tipo de porção:',
    items: [
      { id: 0, name: 'Todos', checked: true },
      { id: 1, name: 'Porções', checked: false },
      { id: 2, name: 'Pedaços', checked: false },
      { id: 3, name: 'Pratos', checked: false },
      { id: 4, name: 'Fatias', checked: false },
      { id: 5, name: 'Unidades', checked: false },
    ],
  };

  mobileFiltersOpen = false;

  filtrosPendentes = {
    ordenar: 'nome',
    categorias: [] as string[],
    dificuldades: [] as number[],
    tiposPorcao: [] as string[],
    tempoMax: null as number | null,
    tempoMin: null as number | null,
  };

  get totalFiltrosAtivos(): number {
    let count = 0;
    if (this.filtros.ordenar !== 'nome') count++;
    count += this.filtros.categorias.length;
    count += this.filtros.dificuldades.length;
    count += this.filtros.tiposPorcao.length;
    if (this.filtros.tempoMax != null || this.filtros.tempoMin != null) count++;
    return count;
  }

  toggleMobileFilters() {
    if (!this.mobileFiltersOpen) {
      this.filtrosPendentes = { ...this.filtros };
    }
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  fecharMobileFilters() {
    this.mobileFiltersOpen = false;
  }

  aplicarFiltrosMobile() {
    this.filtros = { ...this.filtrosPendentes };
    this.mobileFiltersOpen = false;
    this.buscarReceitas();
  }

  filtros = {
    ordenar: 'nome',
    categorias: [] as string[],
    dificuldades: [] as number[],
    tiposPorcao: [] as string[],
    tempoMax: null as number | null,
    tempoMin: null as number | null,
  };

  private mapaOrdenacao: Record<string, string> = {
    'Por nome': 'nome',
    'Mais novas': 'mais_novos',
    'Mais antigas': 'mais_antigos',
    'Mais favoritas': 'mais_favoritos',
  };

  filtrarPorOrdem(filtro: string) {
    const valor = this.mapaOrdenacao[filtro] ?? 'nome';
    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.ordenar = valor;
    } else {
      this.filtros.ordenar = valor;
      this.buscarReceitas();
    }
  }

  filtrarPorCategoria(ids: number[]) {
    const categoriasSelecionadas = this.optionsDropwdown2.items
      .filter((item) => ids.includes(item.id))
      .map((item) => item.name)
      .filter((nome) => nome !== 'Todas');

    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.categorias = categoriasSelecionadas;
    } else {
      this.filtros.categorias = categoriasSelecionadas;
      this.buscarReceitas();
    }
  }

  filtrarPorDificuldade(ids: number[]) {
    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.dificuldades = ids;
    } else {
      this.filtros.dificuldades = ids;
      this.buscarReceitas();
    }
  }

  filtrarPorTipoPorcao(ids: number[]) {
    const mapaId: Record<number, string> = {
      1: 'Porções',
      2: 'Pedaços',
      3: 'Pratos',
      4: 'Fatias',
      5: 'Unidades',
    };
    const tipos = ids.map((id) => mapaId[id]).filter(Boolean);
    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.tiposPorcao = tipos;
    } else {
      this.filtros.tiposPorcao = tipos;
      this.buscarReceitas();
    }
  }

  filtrarPorTempo(nome: string) {
    const item = this.optionsTempo.items.find((i) => i.name === nome);
    if (!item) return;
    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.tempoMax = item.tempoMax;
      this.filtrosPendentes.tempoMin = item.tempoMin;
    } else {
      this.filtros.tempoMax = item.tempoMax;
      this.filtros.tempoMin = item.tempoMin;
      this.buscarReceitas();
    }
  }

  buscarReceitas() {
    let receitas = [...this.Recipes];

    // categoria
    if (this.filtros.categorias.length > 0)
      receitas = receitas.filter((r: any) =>
        this.filtros.categorias.includes(r.categoria),
      );

    // dificuldade
    if (this.filtros.dificuldades.length > 0)
      receitas = receitas.filter((r: any) =>
        this.filtros.dificuldades.includes(r.dificuldade),
      );

    // tipo de porção
    if (this.filtros.tiposPorcao.length > 0)
      receitas = receitas.filter((r: any) =>
        this.filtros.tiposPorcao.includes(r.tipo_porcao),
      );

    // tempo de preparo
    if (this.filtros.tempoMax != null) {
      receitas = receitas.filter(
        (r: any) => r.tempo_hora * 60 + r.tempo_min <= this.filtros.tempoMax!,
      );
    }
    if (this.filtros.tempoMin != null) {
      receitas = receitas.filter(
        (r: any) => r.tempo_hora * 60 + r.tempo_min >= this.filtros.tempoMin!,
      );
    }

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
    const filtrosVazios = {
      ordenar: 'nome',
      categorias: [] as string[],
      dificuldades: [] as number[],
      tiposPorcao: [] as string[],
      tempoMax: null as number | null,
      tempoMin: null as number | null,
    };

    this.filtros = { ...filtrosVazios };
    this.filtrosPendentes = { ...filtrosVazios };

    this.optionsDropwdown.items.forEach((i, idx) => (i.checked = idx === 0));
    this.optionsDropwdown2.items.forEach((i) => {
      i.checked = i.id === 0;
    });
    this.optionsDificuldade.items.forEach((i) => {
      i.checked = i.id === 0;
    });
    this.optionsTempo.items.forEach((i, idx) => (i.checked = idx === 0));
    this.optionsTipoPorcao.items.forEach((i) => {
      i.checked = i.id === 0;
    });

    this.mobileFiltersOpen = false;
    this.buscarReceitas();
  }

  get RecipesPage() {
    return this.RecipesFiltradas.slice(this.begin, this.end);
  }

  verMais() {
    this.end += 8;
  }
}
