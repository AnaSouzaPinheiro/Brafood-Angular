import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { BarraFiltros, ChipFiltro } from '../../shared/barra-filtros/barra-filtros';
import { RecipeCardSkeleton } from '../../shared/recipe-card-skeleton/recipe-card-skeleton';

import { CategoriaService } from '../../services/categoria/categoria.service';
import {
    FilterStateService,
    FiltroState,
} from '../../services/filter/filter-state.service';
import { ReceitaService } from '../../services/receita/receita.service';

import { Categoria as CategoriaModel } from '../../model/categoria';
import { Recipes } from '../../model/myrecipes';
import { AuthService } from '../../services/auth/auth.service';
import { ModalService } from '../../services/modal/modal.service';

@Component({
  selector: 'bra-categoria',
  standalone: true,
  imports: [BarraFiltros, CustomButton, RecipeCard, RecipeCardSkeleton, CommonModule, FormsModule],
  templateUrl: './categoria.html',
  styleUrl: './categoria.scss',
})
export class Categoria {
  categoria?: CategoriaModel;
  usuarioId: number | null = null;

  Recipes: Recipes[] = [];
  RecipesFiltradas: Recipes[] = [];

  categoriaTemReceitas = false;
  loadingCategoria = true;

  begin = 0;
  end = 8;

  filtros!: FiltroState;
  termoBusca = '';

  subcategoriaChips: ChipFiltro[] = [];
  /** Subcategorias marcadas no cabeçalho (vazio = todas). */
  subcatsMarcadas: number[] = [];

  // Imagem de fundo do cabeçalho
  fundoCarregado = false;
  fundoFalhou = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: ModalService,
    private receitaService: ReceitaService,
    private categoriaService: CategoriaService,
    private filterService: FilterStateService,
  ) {
    this.filtros = this.filterService.filtroInicial();
  }

  ngOnInit(): void {
    this.usuarioId = this.authService.getUserId();

    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          const nome = params.get('nome');
          if (!id || !nome) throw new Error('Categoria inválida');
          return this.categoriaService.getCatById(Number(id));
        }),
      )
      .subscribe({
        next: (categoria) => {
          this.categoria = categoria;

          this.subcategoriaChips = categoria.subcategorias.map((s) => ({
            id: s.id,
            nome: s.nome,
          }));

          this.subcatsMarcadas = [];
          this.fundoCarregado = false;
          this.fundoFalhou = false;
          this.categoriaTemReceitas = false;
          this.buscarReceitas(true);
        },
        error: () => {
          this.loadingCategoria = false;
        },
      });
  }

  onFiltrosChange(filtros: FiltroState) {
    this.filtros = filtros;
    this.buscarReceitas(false);
  }

  /**
   * @param primeiraCargas — quando true, atualiza categoriaTemReceitas.
   * Nas buscas com filtro ativo nunca derruba esse flag.
   */
  buscarReceitas(primeiraCarga = false) {
    if (!this.categoria) return;

    const req: any = { ordenar: this.filtros.ordenar };

    if (this.subcatsMarcadas.length) req.subcategorias = this.subcatsMarcadas;
    if (this.filtros.dificuldades.length)
      req.dificuldades = this.filtros.dificuldades;
    if (this.filtros.tiposPorcao.length)
      req.tiposPorcao = this.filtros.tiposPorcao;
    if (this.filtros.tempoMax != null) req.tempoMax = this.filtros.tempoMax;

    this.receitaService
      .listCat({ id: this.categoria.id, nome: this.categoria.nome }, req)
      .subscribe((res) => {
        this.Recipes = res;
        this.aplicarFiltroNome();

        if (primeiraCarga) {
          this.categoriaTemReceitas = this.RecipesFiltradas.length > 0;
          this.loadingCategoria = false;
        }

        this.begin = 0;
        this.end = 8;
      });
  }

  /** Versão .webp dos fundos em assets (bem mais leve que o .jpg). */
  get fundoOtimizado(): string | undefined {
    const f = this.categoria?.fundo;
    if (!f) return f;
    return /assets\/imagens\/fundos\/[^/]+\.jpe?g$/i.test(f) ? f.replace(/\.jpe?g$/i, '.webp') : f;
  }

  aoFalharFundo() {
    if (!this.fundoFalhou) {
      this.fundoFalhou = true; // tenta o arquivo original
    } else {
      this.fundoCarregado = true; // nem o original: não deixa invisível
    }
  }

  alternarSubcat(id: number) {
    this.subcatsMarcadas = this.subcatsMarcadas.includes(id)
      ? this.subcatsMarcadas.filter((s) => s !== id)
      : [...this.subcatsMarcadas, id];
    this.buscarReceitas(false);
  }

  limparSubcats() {
    this.subcatsMarcadas = [];
    this.buscarReceitas(false);
  }

  onBuscaChange(valor: string) {
    this.termoBusca = valor;
    this.aplicarFiltroNome();
    this.begin = 0;
    this.end = 8;
  }

  private aplicarFiltroNome() {
    let resultado =
      this.filtros.tempoMin != null
        ? this.Recipes.filter(
            (r) =>
              (r.tempo_hora ?? 0) * 60 + (r.tempo_min ?? 0) >=
              this.filtros.tempoMin!,
          )
        : [...this.Recipes];

    if (this.termoBusca.trim()) {
      const termo = this.normalizar(this.termoBusca);
      resultado = resultado.filter((r: any) =>
        this.normalizar(r.titulo).includes(termo),
      );
    }

    this.RecipesFiltradas = resultado;
  }

  private normalizar(texto: string): string {
    return (texto || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  }

  get RecipesPage() {
    return this.RecipesFiltradas.slice(this.begin, this.end);
  }

  verMais() {
    this.end += 8;
  }

  adicionarReceita() {
    if (!this.usuarioId) {
      this.modalService.open({
        type: 'confirm',
        title: 'Login necessário',
        message: 'Para adicionar uma receita, você precisa estar logado.',
        confirmText: 'Ir para login',
        cancelText: 'Cancelar',
        onConfirm: () => {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url },
          });
        },
      });
      return;
    }

    this.router.navigate(['/adicionar-receita/hub']);
  }
}