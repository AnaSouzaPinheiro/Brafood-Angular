import { Component } from '@angular/core';
import { FilterDropdown } from '../filter-dropdown/filter-dropdown';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Recipes } from '../../model/myrecipes';
import { ReceitaService } from '../../services/receita/receita.service';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { Categoria as CategoriaModel } from '../../model/categoria';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

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
      { name: 'Qualquer tempo', checked: true, tempoMax: null },
      { name: 'Rápido (até 30 min)', checked: false, tempoMax: 30 },
      { name: 'Médio (até 1 hora)', checked: false, tempoMax: 60 },
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
  isMobile = false;

  // Filtros pendentes: acumulam enquanto o painel está aberto (mobile)
  filtrosPendentes = {
    ordenar: 'nome',
    subcategorias: [] as number[],
    dificuldades: [] as number[],
    tiposPorcao: [] as string[],
    tempoMax: null as number | null,
    tempoMin: null as number | null,
  };

  get totalFiltrosAtivos(): number {
    let count = 0;
    if (this.filtros.ordenar !== 'nome') count++;
    count += this.filtros.subcategorias.length;
    count += this.filtros.dificuldades.length;
    count += this.filtros.tiposPorcao.length;
    if (this.filtros.tempoMax != null || this.filtros.tempoMin != null) count++;
    return count;
  }

  toggleMobileFilters() {
    if (!this.mobileFiltersOpen) {
      // Ao abrir, sincroniza pendentes com filtros ativos
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
    subcategorias: [] as number[],
    dificuldades: [] as number[],
    tiposPorcao: [] as string[],
    tempoMax: null as number | null,
    tempoMin: null as number | null,
  };

  categoria?: CategoriaModel;

  Recipes: Recipes[] = [];
  RecipesFiltradas: Recipes[] = [];

  begin = 0;
  end = 8;

  constructor(
    private route: ActivatedRoute,
    private ReceitaService: ReceitaService,
    private categoriaService: CategoriaService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const nome = params.get('nome');
          const id = params.get('id');

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
    const valor = this.mapaOrdenacao[filtro] ?? 'nome';
    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.ordenar = valor;
    } else {
      this.filtros.ordenar = valor;
      this.buscarReceitas();
    }
  }

  filtrarPorSubcategoria(ids: number[]) {
    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.subcategorias = ids;
    } else {
      this.filtros.subcategorias = ids;
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
    const tempoMax = item.tempoMax ?? null;
    const tempoMin = (item as any).tempoMin ?? null;
    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.tempoMax = tempoMax;
      this.filtrosPendentes.tempoMin = tempoMin;
    } else {
      this.filtros.tempoMax = tempoMax;
      this.filtros.tempoMin = tempoMin;
      this.buscarReceitas();
    }
  }

  buscarReceitas() {
    if (!this.categoria) return;

    const filtrosRequest: any = {
      ordenar: this.filtros.ordenar,
    };

    if (this.filtros.subcategorias.length > 0) {
      filtrosRequest.subcategorias = this.filtros.subcategorias;
    }

    if (this.filtros.dificuldades.length > 0) {
      filtrosRequest.dificuldades = this.filtros.dificuldades;
    }

    if (this.filtros.tiposPorcao.length > 0) {
      filtrosRequest.tiposPorcao = this.filtros.tiposPorcao;
    }

    if (this.filtros.tempoMax != null) {
      filtrosRequest.tempoMax = this.filtros.tempoMax;
    }

    this.ReceitaService.listCat(
      { id: this.categoria.id, nome: this.categoria.nome },
      filtrosRequest,
    ).subscribe((res) => {
      this.Recipes = res;

      // Filtro de tempo mínimo (faixa "Longo") aplicado no frontend
      if (this.filtros.tempoMin != null) {
        const min = this.filtros.tempoMin;
        this.RecipesFiltradas = res.filter(
          (r) => (r.tempo_hora ?? 0) * 60 + (r.tempo_min ?? 0) >= min,
        );
      } else {
        this.RecipesFiltradas = [...res];
      }

      this.begin = 0;
      this.end = 8;
    });
  }

  limparFiltros() {
    const filtrosVazios = {
      ordenar: 'nome',
      subcategorias: [] as number[],
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
