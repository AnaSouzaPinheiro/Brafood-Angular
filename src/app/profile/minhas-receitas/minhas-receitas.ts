import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CustomButton } from '../../shared/custom-button/custom-button';
import {
    DropdownDinamicoItem,
    FilterPanel,
} from '../../shared/filter-panel/filter-panel';
import { RecipeCardSkeleton } from '../../shared/recipe-card-skeleton/recipe-card-skeleton';
import { Perfil } from '../perfil/perfil';

import { AuthService } from '../../services/auth/auth.service';
import {
    FilterStateService,
    FiltroState,
} from '../../services/filter/filter-state.service';
import { ModalService } from '../../services/modal/modal.service';
import { ReceitaService } from '../../services/receita/receita.service';

import { Recipes } from '../../model/myrecipes';
import { Receita } from '../../model/receita';
import { User } from '../../model/user';
import { toSlug } from '../../utils/slug';

@Component({
  selector: 'bra-minhas-receitas',
  standalone: true,
  imports: [
    Perfil,
    FilterPanel,
    CustomButton,
    RecipeCard,
    RecipeCardSkeleton,
    RouterModule,
    CommonModule,
    FormsModule,
  ],
  templateUrl: './minhas-receitas.html',
  styleUrls: ['./minhas-receitas.scss'],
})
export class MinhasReceitas {
  // ── Paginação ─────────────────────────────────────────────────────────────
  indice = 0;
  currentPage = 1;

  // ── Dados ─────────────────────────────────────────────────────────────────
  Recipes: Recipes[] = [];
  RecipesFiltradas: Recipes[] = [];

  logado = false;
  userId: string | null = null;
  user!: User;
  loadingRecipes = true;

  // ── Filtros ───────────────────────────────────────────────────────────────
  filtros!: FiltroState;
  termoBusca = '';

  // Dropdown dinâmico de categorias das receitas do usuário
  categoriaItems: DropdownDinamicoItem[] = [];

  constructor(
    private receitaServices: ReceitaService,
    private auth: AuthService,
    private router: Router,
    private modalService: ModalService,
    private filterService: FilterStateService,
  ) {
    this.logado = this.auth.isLoggedIn();

    const userData = localStorage.getItem('user');
    if (userData) this.userId = JSON.parse(userData).id;

    if (this.userId) {
      this.receitaServices
        .listPorUser(Number(this.userId))
        .subscribe({
          next: (data) => {
            this.Recipes = data;
            this.montarCategorias();
            this.aplicarFiltros();
            this.loadingRecipes = false;
          },
          error: () => {
            this.loadingRecipes = false;
          },
        });
    } else {
      this.loadingRecipes = false;
    }

    this.filtros = this.filterService.filtroInicial('mais_novos');
  }

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;
  }

  // ── Guard de filtro ───────────────────────────────────────────────────────
  get podeFiltrar(): boolean {
    return this.Recipes.length > 1;
  }

  // ── Paginação ─────────────────────────────────────────────────────────────
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

  // ── Filtros ───────────────────────────────────────────────────────────────
  onFiltrosChange(filtros: FiltroState) {
    this.filtros = filtros;
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    const base = this.termoBusca.trim()
      ? this.Recipes.filter((r: any) =>
          this.normalizar(r.titulo).includes(this.normalizar(this.termoBusca)),
        )
      : this.Recipes;

    this.RecipesFiltradas = this.filterService.aplicarFiltrosFrontend(
      base,
      this.filtros,
    );
    this.indice = 0;
    this.currentPage = 1;
  }

  onBuscaChange(valor: string) {
    this.termoBusca = valor;
    this.aplicarFiltros();
  }

  private normalizar(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  // ── Categorias dinâmicas ──────────────────────────────────────────────────
  private montarCategorias() {
    const categoriasUnicas = [
      ...new Set(this.Recipes.map((r: any) => r.categoria)),
    ];
    this.categoriaItems = [
      { id: 0, name: 'Todas', checked: true },
      ...categoriasUnicas.map((c, i) => ({
        id: i + 1,
        name: c as string,
        checked: false,
      })),
    ];
  }

  // ── Editar / Excluir ──────────────────────────────────────────────────────
  editarReceita(recipe: Receita) {
    this.router.navigate(['/editar-receita', toSlug(recipe.titulo), recipe.id]);
  }

  excluirReceita(id: number) {
    this.modalService.open({
      type: 'warning',
      title: 'Excluir receita',
      message:
        'Tem certeza que deseja excluir esta receita? Essa ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.confirmarExclusao(id);
      },
    });
  }

  private confirmarExclusao(id: number) {
    this.receitaServices.excluir(id).subscribe({
      next: () => {
        this.Recipes = this.Recipes.filter((r) => r.id !== id);
        this.montarCategorias();
        this.aplicarFiltros();

        this.modalService.open({
          type: 'success',
          title: 'Receita excluída',
          message: 'A receita foi excluída com sucesso!',
          confirmText: 'OK',
        });
      },
      error: () => {
        this.modalService.open({
          type: 'error',
          title: 'Erro',
          message: 'Não foi possível excluir a receita. Tente novamente.',
        });
      },
    });
  }
}