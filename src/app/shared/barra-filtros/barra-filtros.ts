import { CommonModule } from '@angular/common';
import {
  AfterViewChecked,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  FilterStateService,
  FiltroState,
  MAPA_ORDENACAO,
  MAPA_TIPO_PORCAO,
  OPTIONS_DIFICULDADE,
  OPTIONS_TEMPO,
  OPTIONS_TIPO_PORCAO,
} from '../../services/filter/filter-state.service';

/** Item da linha de chips (subcategoria ou categoria). */
export interface ChipFiltro {
  id: number;
  nome: string;
}

/** Filtro ativo exibido como chip removível. */
interface FiltroAtivo {
  rotulo: string;
  remover: () => void;
}

/**
 * Barra de busca e filtros das páginas de categoria e de minhas receitas:
 *   linha 1 — busca (principal) · Ordenar · Filtros (opcional, com contador)
 *   linha 2 — chips roláveis (subcategorias ou categorias), multisseleção
 *   linha 3 — contador + filtros ativos removíveis + "Limpar tudo"
 *
 * Os filtros aplicam na hora (sem botão "Aplicar").
 */
@Component({
  selector: 'bra-barra-filtros',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './barra-filtros.html',
  styleUrls: ['./barra-filtros.scss', './painel.scss'],
})
export class BarraFiltros implements OnInit, AfterViewChecked {
  @ViewChild('trilho') trilho?: ElementRef<HTMLDivElement>;

  /** Setas < > dos chips: só aparecem quando há o que rolar naquele lado. */
  podeVoltar = false;
  podeAvancar = false;

  @Input() placeholder = 'Buscar receitas...';
  /** 'subcategoria' emite ids; 'categoria' emite nomes. */
  @Input() modo: 'subcategoria' | 'categoria' = 'subcategoria';
  @Input() chips: ChipFiltro[] = [];
  @Input() total = 0;
  @Input() ordenarInicial = 'nome';
  /** Mostra o botão "Filtros" (dificuldade, tempo, porção). */
  @Input() filtrosAvancados = true;

  @Output() filtrosChange = new EventEmitter<FiltroState>();
  @Output() buscaChange = new EventEmitter<string>();

  filtros!: FiltroState;
  termo = '';
  chipsMarcados: number[] = [];

  menuOrdenar = false;
  painelFiltros = false;

  readonly opcoesOrdenar = Object.entries(MAPA_ORDENACAO).map(([nome, valor]) => ({
    nome,
    valor,
  }));
  readonly dificuldades = OPTIONS_DIFICULDADE.items.filter((i) => i.id !== 0);
  readonly tempos = OPTIONS_TEMPO.items;
  readonly porcoes = OPTIONS_TIPO_PORCAO.items.filter((i) => i.id !== 0);

  constructor(
    private filterService: FilterStateService,
    private host: ElementRef<HTMLElement>,
  ) {}

  ngOnInit() {
    this.filtros = this.filterService.filtroInicial(this.ordenarInicial);
  }

  ngAfterViewChecked() {
    // Mede depois de renderizar (chips chegam assíncronos). Só altera
    // o estado se mudou, para não entrar em ciclo de detecção.
    const el = this.trilho?.nativeElement;
    if (!el) return;
    const voltar = el.scrollLeft > 2;
    const avancar = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
    if (voltar !== this.podeVoltar || avancar !== this.podeAvancar) {
      setTimeout(() => this.atualizarSetas());
    }
  }

  @HostListener('window:resize')
  atualizarSetas() {
    const el = this.trilho?.nativeElement;
    if (!el) return;
    this.podeVoltar = el.scrollLeft > 2;
    this.podeAvancar = el.scrollLeft + el.clientWidth < el.scrollWidth - 2;
  }

  rolarChips(direcao: -1 | 1) {
    const el = this.trilho?.nativeElement;
    if (!el) return;
    el.scrollBy({ left: direcao * el.clientWidth * 0.7, behavior: 'smooth' });
  }

  // ── fechar menus ──────────────────────────────────────────────────────────
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!this.host.nativeElement.contains(e.target as Node)) this.fecharMenus();
  }

  @HostListener('document:keydown.escape')
  fecharMenus() {
    this.menuOrdenar = false;
    this.painelFiltros = false;
  }

  alternarOrdenar() {
    this.painelFiltros = false;
    this.menuOrdenar = !this.menuOrdenar;
  }

  alternarPainel() {
    this.menuOrdenar = false;
    this.painelFiltros = !this.painelFiltros;
  }

  // ── busca ─────────────────────────────────────────────────────────────────
  onBusca(valor: string) {
    this.termo = valor;
    this.buscaChange.emit(valor);
  }

  limparBusca() {
    this.onBusca('');
  }

  // ── ordenar ───────────────────────────────────────────────────────────────
  get rotuloOrdenar(): string {
    return this.opcoesOrdenar.find((o) => o.valor === this.filtros.ordenar)?.nome ?? 'Ordenar';
  }

  ordenar(valor: string) {
    this.filtros.ordenar = valor;
    this.menuOrdenar = false;
    this.emitir();
  }

  // ── chips ─────────────────────────────────────────────────────────────────
  chipAtivo(id: number) {
    return this.chipsMarcados.includes(id);
  }

  alternarChip(id: number) {
    this.chipsMarcados = this.chipAtivo(id)
      ? this.chipsMarcados.filter((c) => c !== id)
      : [...this.chipsMarcados, id];
    this.sincronizarChips();
  }

  limparChips() {
    this.chipsMarcados = [];
    this.sincronizarChips();
  }

  private sincronizarChips() {
    if (this.modo === 'subcategoria') {
      this.filtros.subcategorias = [...this.chipsMarcados];
    } else {
      this.filtros.categorias = this.chips
        .filter((c) => this.chipsMarcados.includes(c.id))
        .map((c) => c.nome);
    }
    this.emitir();
  }

  // ── filtros avançados ─────────────────────────────────────────────────────
  alternarDificuldade(id: number) {
    const d = this.filtros.dificuldades;
    this.filtros.dificuldades = d.includes(id) ? d.filter((x) => x !== id) : [...d, id];
    this.emitir();
  }

  tempoAtivo(t: { tempoMax: number | null; tempoMin: number | null }) {
    return this.filtros.tempoMax === t.tempoMax && this.filtros.tempoMin === t.tempoMin;
  }

  escolherTempo(t: { tempoMax: number | null; tempoMin: number | null }) {
    this.filtros.tempoMax = t.tempoMax;
    this.filtros.tempoMin = t.tempoMin;
    this.emitir();
  }

  porcaoAtiva(id: number) {
    return this.filtros.tiposPorcao.includes(MAPA_TIPO_PORCAO[id]);
  }

  alternarPorcao(id: number) {
    const tipo = MAPA_TIPO_PORCAO[id];
    const p = this.filtros.tiposPorcao;
    this.filtros.tiposPorcao = p.includes(tipo) ? p.filter((x) => x !== tipo) : [...p, tipo];
    this.emitir();
  }

  /** Quantos filtros avançados estão ativos (badge do botão). */
  get totalAvancados(): number {
    return (
      this.filtros.dificuldades.length +
      this.filtros.tiposPorcao.length +
      (this.filtros.tempoMax != null || this.filtros.tempoMin != null ? 1 : 0)
    );
  }

  limparAvancados() {
    this.filtros.dificuldades = [];
    this.filtros.tiposPorcao = [];
    this.filtros.tempoMax = null;
    this.filtros.tempoMin = null;
    this.emitir();
  }

  // ── filtros ativos (chips removíveis) ─────────────────────────────────────
  get ativos(): FiltroAtivo[] {
    const lista: FiltroAtivo[] = [];
    if (this.termo.trim()) {
      lista.push({ rotulo: `"${this.termo.trim()}"`, remover: () => this.limparBusca() });
    }
    for (const id of this.filtros.dificuldades) {
      const d = this.dificuldades.find((x) => x.id === id);
      if (d) lista.push({ rotulo: d.name, remover: () => this.alternarDificuldade(id) });
    }
    const tempo = this.tempos.find((t) => t.tempoMax !== null || t.tempoMin !== null ? this.tempoAtivo(t) : false);
    if (tempo) {
      lista.push({
        rotulo: tempo.name,
        remover: () => this.escolherTempo({ tempoMax: null, tempoMin: null }),
      });
    }
    for (const p of this.porcoes) {
      if (this.porcaoAtiva(p.id)) {
        lista.push({ rotulo: p.name, remover: () => this.alternarPorcao(p.id) });
      }
    }
    return lista;
  }

  get temAlgoAtivo(): boolean {
    return this.ativos.length > 0 || this.chipsMarcados.length > 0;
  }

  limparTudo() {
    this.termo = '';
    this.buscaChange.emit('');
    this.chipsMarcados = [];
    this.filtros = this.filterService.filtroInicial(this.filtros.ordenar);
    this.emitir();
  }

  private emitir() {
    this.filtrosChange.emit(this.filterService.clonarFiltro(this.filtros));
  }
}
