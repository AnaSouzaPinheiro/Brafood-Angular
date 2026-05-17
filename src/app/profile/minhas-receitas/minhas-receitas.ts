import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { Perfil } from '../perfil/perfil';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { FilterDropdown } from '../../category/filter-dropdown/filter-dropdown';

import { ReceitaService } from '../../services/receita/receita.service';
import { AuthService } from '../../services/auth/auth.service';
import { ModalService } from '../../services/modal/modal.service';

import { Recipes } from '../../model/myrecipes';
import { Receita } from '../../model/receita';
import { User } from '../../model/user';

import { toSlug } from '../../utils/slug';

@Component({
  selector: 'bra-minhas-receitas',
  standalone: true,
  imports: [
    Perfil,
    CustomButton,
    RecipeCard,
    RouterModule,
    CommonModule,
    FilterDropdown,
  ],
  templateUrl: './minhas-receitas.html',
  styleUrls: ['./minhas-receitas.scss'],
})
export class MinhasReceitas {
  // PAGINAÇÃO
  indice = 0;
  currentPage = 1;

  // DADOS
  Recipes: Recipes[] = [];
  RecipesFiltradas: Recipes[] = [];

  logado = false;
  userId: string | null = null;
  user!: User;

  // FILTROS
  filtros = {
    ordenar: 'nome',
    categorias: [] as string[],
    dificuldades: [] as number[],
    tiposPorcao: [] as string[],
    tempoMax: null as number | null,
    tempoMin: null as number | null,
  };

  filtrosPendentes = { ...this.filtros };

  mobileFiltersOpen = false;

  private mapaOrdenacao: Record<string, string> = {
    'Por nome': 'nome',
    'Mais novas': 'mais_novos',
    'Mais antigas': 'mais_antigos',
    'Mais favoritas': 'mais_favoritos',
  };

  constructor(
    private ReceitaServices: ReceitaService,
    private auth: AuthService,
    private router: Router,
    private modalService: ModalService,
  ) {
    this.logado = this.auth.isLoggedIn();

    const userData = localStorage.getItem('user');
    if (userData) {
      this.userId = JSON.parse(userData).id;
    }

    if (this.userId) {
      this.ReceitaServices.listPorUser(Number(this.userId)).subscribe(
        (data) => {
          this.Recipes = data;

          this.montarCategorias();
          this.buscarReceitas();
        },
      );
    }
  }

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;
  }

  // BASE DO FILTRO
  get podeFiltrar(): boolean {
    return this.Recipes.length > 1;
  }

  get totalFiltrosAtivos(): number {
    let count = 0;

    if (this.filtros.ordenar !== 'nome') count++;
    count += this.filtros.categorias.length;
    count += this.filtros.dificuldades.length;
    count += this.filtros.tiposPorcao.length;

    if (this.filtros.tempoMax != null || this.filtros.tempoMin != null) {
      count++;
    }

    return count;
  }

  // PAGINAÇÃO (FILTRADO)
  get myRecipesPage() {
    return this.RecipesFiltradas.slice(this.indice, this.indice + 8);
  }

  get pages(): number {
    return Math.ceil(this.RecipesFiltradas.length / 8);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }

  nextPage() {
    let newIndex = this.indice + 8;
    if (newIndex >= this.RecipesFiltradas.length) newIndex = 0;
    this.indice = newIndex;
    this.currentPage = this.indice / 8 + 1;
  }

  prevPage() {
    let newIndex = this.indice - 8;
    if (newIndex < 0) newIndex = (this.pages - 1) * 8;
    this.indice = newIndex;
    this.currentPage = this.indice / 8 + 1;
  }

  goToPage(page: number) {
    this.indice = (page - 1) * 8;
    this.currentPage = page;
  }

  // EDITAR / EXCLUIR
  editarReceita(recipe: Receita) {
    this.router.navigate(['/editar-receita', toSlug(recipe.titulo), recipe.id]);
  }

  excluirReceita(id: number) {
    this.modalService.open({
      type: 'warning',
      title: 'Excluir receita',
      message: 'Tem certeza?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => this.confirmarExclusao(id),
    });
  }

  private confirmarExclusao(id: number) {
    this.ReceitaServices.excluir(id).subscribe({
      next: () => {
        this.Recipes = this.Recipes.filter((r) => r.id !== id);
        this.buscarReceitas();

        this.modalService.open({
          type: 'success',
          title: 'Excluído',
          message: 'Receita removida',
          confirmText: 'OK',
        });
      },
    });
  }

  // CATEGORIAS
  optionsDropwdown2 = {
    labelTitle: 'Categorias:',
    items: [] as { id: number; name: string; checked: boolean }[],
  };

  private montarCategorias() {
    const categoriasUnicas = [
      ...new Set(this.Recipes.map((r: any) => r.categoria)),
    ];

    this.optionsDropwdown2.items = [
      { id: 0, name: 'Todas', checked: true },
      ...categoriasUnicas.map((c, i) => ({
        id: i + 1,
        name: c,
        checked: false,
      })),
    ];
  }

  // OPTIONS
  optionsDropwdown = {
    labelTitle: 'Ordenar Por:',
    items: [
      { name: 'Por nome', checked: true },
      { name: 'Mais novas', checked: false },
      { name: 'Mais antigas', checked: false },
      { name: 'Mais favoritas', checked: false },
    ],
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
    labelTitle: 'Tempo:',
    items: [
      { name: 'Qualquer tempo', tempoMax: null, tempoMin: null, checked: true },
      { name: 'Até 30 min', tempoMax: 30, tempoMin: null, checked: false },
      { name: 'Até 1h', tempoMax: 60, tempoMin: null, checked: false },
      { name: 'Acima de 1h', tempoMax: null, tempoMin: 61, checked: false },
    ],
  };

  optionsTipoPorcao = {
    labelTitle: 'Porção:',
    items: [
      { id: 0, name: 'Todos', checked: true },
      { id: 1, name: 'Porções', checked: false },
      { id: 2, name: 'Pedaços', checked: false },
      { id: 3, name: 'Pratos', checked: false },
      { id: 4, name: 'Fatias', checked: false },
      { id: 5, name: 'Unidades', checked: false },
    ],
  };

  // FILTROS
  buscarReceitas() {
    let receitas = [...this.Recipes];

    if (this.filtros.categorias.length) {
      receitas = receitas.filter((r: any) =>
        this.filtros.categorias.includes(r.categoria),
      );
    }

    if (this.filtros.dificuldades.length) {
      receitas = receitas.filter((r: any) =>
        this.filtros.dificuldades.includes(r.dificuldade),
      );
    }

    if (this.filtros.tiposPorcao.length) {
      receitas = receitas.filter((r: any) =>
        this.filtros.tiposPorcao.includes(r.tipo_porcao),
      );
    }

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
    this.indice = 0;
    this.currentPage = 1;
  }

  // MOBILE
  toggleMobileFilters() {
    if (!this.mobileFiltersOpen) {
      this.filtrosPendentes = {
        ordenar: this.filtros.ordenar,
        categorias: [...this.filtros.categorias],
        dificuldades: [...this.filtros.dificuldades],
        tiposPorcao: [...this.filtros.tiposPorcao],
        tempoMax: this.filtros.tempoMax,
        tempoMin: this.filtros.tempoMin,
      };
    }
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  fecharMobileFilters() {
    this.mobileFiltersOpen = false;
  }

  aplicarFiltrosMobile() {
    this.filtros = {
      ordenar: this.filtrosPendentes.ordenar,
      categorias: [...this.filtrosPendentes.categorias],
      dificuldades: [...this.filtrosPendentes.dificuldades],
      tiposPorcao: [...this.filtrosPendentes.tiposPorcao],
      tempoMax: this.filtrosPendentes.tempoMax,
      tempoMin: this.filtrosPendentes.tempoMin,
    };

    this.mobileFiltersOpen = false;

    this.buscarReceitas();
  }

  limparFiltros() {
    this.filtros = {
      ordenar: 'nome',
      categorias: [],
      dificuldades: [],
      tiposPorcao: [],
      tempoMax: null,
      tempoMin: null,
    };

    this.resetDropdowns();

    this.buscarReceitas();
    this.mobileFiltersOpen = false;
  }

  // EVENTOS FILTROS
  filtrarPorOrdem(value: string) {
    const valor = this.mapaOrdenacao[value] ?? 'nome';
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
    const map: any = {
      1: 'Porções',
      2: 'Pedaços',
      3: 'Pratos',
      4: 'Fatias',
      5: 'Unidades',
    };
    const tipos = ids.map((id) => map[id]).filter(Boolean);
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

  private resetDropdowns() {
    this.optionsDropwdown.items = this.optionsDropwdown.items.map((i) => ({
      ...i,
      checked: i.name === 'Por nome',
    }));

    this.optionsDropwdown2.items = this.optionsDropwdown2.items.map((i) => ({
      ...i,
      checked: i.name === 'Todas',
    }));

    this.optionsDificuldade.items = this.optionsDificuldade.items.map((i) => ({
      ...i,
      checked: i.name === 'Todas',
    }));

    this.optionsTempo.items = this.optionsTempo.items.map((i) => ({
      ...i,
      checked: i.name === 'Qualquer tempo',
    }));

    this.optionsTipoPorcao.items = this.optionsTipoPorcao.items.map((i) => ({
      ...i,
      checked: i.name === 'Todos',
    }));
  }
}
