import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { QuadroService, ReceitaCompras } from '../../services/quadro/quadro.service';
import { ToastService } from '../../services/toast/toast.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';

/**
 * Lista de compras de um quadro, agrupada por receita.
 * Passo 1: escolher receitas (todas marcadas). Passo 2: lista com checkbox.
 * O que foi riscado fica salvo só neste navegador (localStorage), por quadro.
 */
@Component({
  selector: 'bra-lista-compras',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe],
  templateUrl: './lista-compras.html',
  styleUrl: './lista-compras.scss',
})
export class ListaCompras implements OnInit {
  @Input({ required: true }) idQuadro!: number;
  @Input() nomeQuadro = '';
  /** Receitas do quadro (id, titulo, imagem1). */
  @Input() receitas: any[] = [];
  @Output() fechar = new EventEmitter<void>();

  passo: 'escolher' | 'lista' = 'escolher';
  escolhidas = new Set<number>();
  lista: ReceitaCompras[] = [];
  carregando = false;
  riscados = new Set<string>();

  constructor(
    private quadroService: QuadroService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    this.escolhidas = new Set(this.receitas.map((r) => Number(r.id)));
    this.riscados = new Set(this.lerRiscados());
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.fechar.emit();
  }

  // ---- passo 1 ---------------------------------------------------------------
  toggle(id: number) {
    this.escolhidas.has(id) ? this.escolhidas.delete(id) : this.escolhidas.add(id);
  }

  get todasEscolhidas() {
    return this.escolhidas.size === this.receitas.length;
  }

  toggleTodas() {
    this.escolhidas = this.todasEscolhidas
      ? new Set()
      : new Set(this.receitas.map((r) => Number(r.id)));
  }

  gerar() {
    if (!this.escolhidas.size) return;
    this.carregando = true;
    this.quadroService.listaDeCompras(this.idQuadro, [...this.escolhidas]).subscribe({
      next: (lista) => {
        this.lista = lista;
        this.passo = 'lista';
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toast.show('Não foi possível montar a lista', 'error');
      },
    });
  }

  // ---- passo 2 ---------------------------------------------------------------
  chave(r: ReceitaCompras, grupo: string, item: string) {
    return `${r.id}|${grupo}|${item}`;
  }

  riscar(k: string) {
    this.riscados.has(k) ? this.riscados.delete(k) : this.riscados.add(k);
    this.salvarRiscados();
  }

  limparRiscados() {
    this.riscados.clear();
    this.salvarRiscados();
  }

  get totalItens() {
    return this.lista.reduce((n, r) => n + r.grupos.reduce((m, g) => m + g.itens.length, 0), 0);
  }

  get totalRiscados() {
    let n = 0;
    this.lista.forEach((r) =>
      r.grupos.forEach((g) => g.itens.forEach((i) => this.riscados.has(this.chave(r, g.titulo, i)) && n++)),
    );
    return n;
  }

  /** Texto da lista (só o que falta comprar). */
  private texto(): string {
    let t = `🛒 Lista de compras${this.nomeQuadro ? ' — ' + this.nomeQuadro : ''}\n`;
    for (const r of this.lista) {
      const linhas: string[] = [];
      for (const g of r.grupos) {
        const itens = g.itens.filter((i) => !this.riscados.has(this.chave(r, g.titulo, i)));
        if (!itens.length) continue;
        if (g.titulo && r.grupos.length > 1) linhas.push(`  ${g.titulo}:`);
        itens.forEach((i) => linhas.push(`  - ${i}`));
      }
      if (linhas.length) t += `\n${r.titulo}\n${linhas.join('\n')}\n`;
    }
    return t;
  }

  copiar() {
    const t = this.texto();
    navigator.clipboard?.writeText(t).then(
      () => this.toast.show('Lista copiada!', 'success'),
      () => this.toast.show('Não foi possível copiar', 'error'),
    );
  }

  whatsapp() {
    window.open('https://wa.me/?text=' + encodeURIComponent(this.texto()), '_blank', 'noopener');
  }

  // ---- localStorage (conveniência por navegador) -----------------------------
  private get chaveStorage() {
    return `brafood-compras-${this.idQuadro}`;
  }

  private lerRiscados(): string[] {
    try {
      return JSON.parse(localStorage.getItem(this.chaveStorage) || '[]');
    } catch {
      return [];
    }
  }

  private salvarRiscados() {
    try {
      localStorage.setItem(this.chaveStorage, JSON.stringify([...this.riscados]));
    } catch {
      /* sem storage: só não lembra */
    }
  }
}
