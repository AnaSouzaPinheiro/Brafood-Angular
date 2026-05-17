import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilterDropdown } from '../../category/filter-dropdown/filter-dropdown';
import { CustomButton } from '../custom-button/custom-button';
import {
  FiltroState,
  MAPA_ORDENACAO,
  MAPA_TIPO_PORCAO,
  OPTIONS_ORDENAR,
  OPTIONS_DIFICULDADE,
  OPTIONS_TEMPO,
  OPTIONS_TIPO_PORCAO,
  FilterStateService,
} from '../../services/filter/filter-state.service';

export interface DropdownDinamicoItem {
  id: number;
  name: string;
  checked: boolean;
}

/**
 * Componente de painel de filtros compartilhado.
 *
 * Funciona em dois modos via [mode]:
 *   - 'subcategoria' → emite ids numéricos como subcategorias (Categoria page)
 *   - 'categoria'    → emite nomes de categoria como strings (Search / MinhasReceitas)
 *
 * Recebe:
 *   [dropdownDinamico] — lista de itens do segundo dropdown (subcats ou categorias)
 *   [labelDinamico]    — label do segundo dropdown
 *   [totalReceitas]    — qtd exibida no contador desktop
 *   [showContadorMobile] — exibe span de receitas ao lado do botão mobile (Categoria)
 *   [totalReceitas]    — número de receitas filtradas
 *
 * Emite:
 *   (filtrosChange) — FiltroState sempre que os filtros ativos mudam
 */
@Component({
  selector: 'bra-filter-panel',
  standalone: true,
  imports: [CommonModule, FilterDropdown, CustomButton],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.scss',
})
export class FilterPanel implements OnChanges {
  // ── Inputs ───────────────────────────────────────────────────────────────
  @Input() mode: 'subcategoria' | 'categoria' = 'categoria';
  @Input() dropdownDinamico: DropdownDinamicoItem[] = [];
  @Input() labelDinamico = 'Categorias:';
  @Input() totalReceitas = 0;
  @Input() showContadorMobile = false;

  // ── Outputs ──────────────────────────────────────────────────────────────
  @Output() filtrosChange = new EventEmitter<FiltroState>();

  // ── Estado interno ───────────────────────────────────────────────────────
  mobileFiltersOpen = false;

  filtros!: FiltroState;
  filtrosPendentes!: FiltroState;

  // Cópias locais dos options estáticos (para reset sem afetar outros componentes)
  optionsOrdenar = this.clonarOptions(OPTIONS_ORDENAR);
  optionsDificuldade = this.clonarOptions(OPTIONS_DIFICULDADE);
  optionsTempo = this.clonarOptions(OPTIONS_TEMPO);
  optionsTipoPorcao = this.clonarOptions(OPTIONS_TIPO_PORCAO);

  optionsDinamico = {
    labelTitle: this.labelDinamico,
    items: [] as DropdownDinamicoItem[],
  };

  constructor(private filterService: FilterStateService) {
    this.filtros = this.filterService.filtroInicial();
    this.filtrosPendentes = this.filterService.filtroInicial();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnChanges(changes: SimpleChanges) {
    if (changes['dropdownDinamico'] || changes['labelDinamico']) {
      this.optionsDinamico = {
        labelTitle: this.labelDinamico,
        items: [...this.dropdownDinamico],
      };
    }
  }

  // ── Contador ─────────────────────────────────────────────────────────────
  get totalFiltrosAtivos(): number {
    return this.filterService.contarFiltrosAtivos(this.filtros);
  }

  // ── Mobile ───────────────────────────────────────────────────────────────
  toggleMobileFilters() {
    if (!this.mobileFiltersOpen)
      this.filtrosPendentes = this.filterService.clonarFiltro(this.filtros);
    this.mobileFiltersOpen = !this.mobileFiltersOpen;
  }

  fecharMobileFilters() {
    this.mobileFiltersOpen = false;
  }

  aplicarFiltrosMobile() {
    this.filtros = this.filterService.clonarFiltro(this.filtrosPendentes);
    this.mobileFiltersOpen = false;
    this.emit();
  }

  // ── Handlers de filtro ───────────────────────────────────────────────────
  filtrarPorOrdem(nome: string) {
    const valor = MAPA_ORDENACAO[nome] ?? 'nome';
    this.setPendente('ordenar', valor, () => this.emit());
  }

  filtrarPorDinamico(ids: number[]) {
    if (this.mode === 'subcategoria') {
      this.setPendente('subcategorias', ids, () => this.emit());
    } else {
      const nomes = this.optionsDinamico.items
        .filter((i) => ids.includes(i.id) && i.name !== 'Todas')
        .map((i) => i.name);
      this.setPendente('categorias', nomes, () => this.emit());
    }
  }

  filtrarPorDificuldade(ids: number[]) {
    this.setPendente('dificuldades', ids, () => this.emit());
  }

  filtrarPorTipoPorcao(ids: number[]) {
    const tipos = ids.map((id) => MAPA_TIPO_PORCAO[id]).filter(Boolean);
    this.setPendente('tiposPorcao', tipos, () => this.emit());
  }

  filtrarPorTempo(nome: string) {
    const item = this.optionsTempo.items.find((i) => i.name === nome);
    if (!item) return;
    if (this.mobileFiltersOpen) {
      this.filtrosPendentes.tempoMax = item.tempoMax ?? null;
      this.filtrosPendentes.tempoMin = (item as any).tempoMin ?? null;
    } else {
      this.filtros.tempoMax = item.tempoMax ?? null;
      this.filtros.tempoMin = (item as any).tempoMin ?? null;
      this.emit();
    }
  }

  limparFiltros() {
    this.filtros = this.filterService.filtroInicial();
    this.filtrosPendentes = this.filterService.filtroInicial();
    this.resetDropdowns();
    this.mobileFiltersOpen = false;
    this.emit();
  }

  // ── Helpers privados ─────────────────────────────────────────────────────
  private setPendente<K extends keyof FiltroState>(
    chave: K,
    valor: FiltroState[K],
    onDesktop: () => void,
  ) {
    if (this.mobileFiltersOpen) {
      (this.filtrosPendentes as any)[chave] = valor;
    } else {
      (this.filtros as any)[chave] = valor;
      onDesktop();
    }
  }

  private emit() {
    this.filtrosChange.emit(this.filterService.clonarFiltro(this.filtros));
  }

  private resetDropdowns() {
    this.optionsOrdenar = this.clonarOptions(OPTIONS_ORDENAR);
    this.optionsDificuldade = this.clonarOptions(OPTIONS_DIFICULDADE);
    this.optionsTempo = this.clonarOptions(OPTIONS_TEMPO);
    this.optionsTipoPorcao = this.clonarOptions(OPTIONS_TIPO_PORCAO);
    this.optionsDinamico = {
      labelTitle: this.labelDinamico,
      items: this.dropdownDinamico.map((i, idx) => ({
        ...i,
        checked: idx === 0,
      })),
    };
  }

  private clonarOptions<T extends { items: any[] }>(opt: T): T {
    return { ...opt, items: opt.items.map((i) => ({ ...i })) };
  }
}
