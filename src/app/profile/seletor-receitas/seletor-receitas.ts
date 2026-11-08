import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { FavoritoService } from '../../services/favorito/favorito.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';

/**
 * Modal para escolher receitas salvas (Favoritos), com filtro por
 * categoria e "selecionar todas desta categoria". Usado ao criar um
 * quadro e ao adicionar receitas a um quadro existente.
 */
@Component({
  selector: 'bra-seletor-receitas',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe],
  templateUrl: './seletor-receitas.html',
  styleUrl: './seletor-receitas.scss',
})
export class SeletorReceitas implements OnInit {
  @Input() titulo = 'Escolha receitas salvas';
  @Input() textoConfirmar = 'Adicionar';
  /** Já selecionadas ao abrir (ex.: escolha anterior no formulário). */
  @Input() selecionadasIniciais: number[] = [];
  /** Receitas que já estão no quadro: aparecem marcadas e travadas. */
  @Input() jaNoQuadro: number[] = [];
  @Output() confirmar = new EventEmitter<number[]>();
  @Output() cancelar = new EventEmitter<void>();

  receitas: any[] = [];
  categorias: string[] = [];
  filtro: string | null = null; // null = todas
  selecionadas = new Set<number>();
  travadas = new Set<number>();
  carregando = true;

  constructor(private favoritoService: FavoritoService) {}

  ngOnInit(): void {
    this.selecionadas = new Set(this.selecionadasIniciais);
    this.travadas = new Set(this.jaNoQuadro);

    this.favoritoService.listarFavoritos(0).subscribe({
      next: (data) => {
        this.receitas = (Array.isArray(data) ? data : []).map((r: any) => ({
          ...r,
          id: Number(r.id),
          _cats: String(r.categorias ?? r.categoria ?? '')
            .split(',')
            .map((c: string) => c.trim())
            .filter(Boolean),
        }));
        const todas = new Set<string>();
        this.receitas.forEach((r) => r._cats.forEach((c: string) => todas.add(c)));
        this.categorias = [...todas].sort((a, b) => a.localeCompare(b, 'pt-BR'));
        this.carregando = false;
      },
      error: () => (this.carregando = false),
    });
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.cancelar.emit();
  }

  get visiveis() {
    return this.filtro ? this.receitas.filter((r) => r._cats.includes(this.filtro)) : this.receitas;
  }

  /** Visíveis que ainda podem ser escolhidas (não travadas). */
  private get escolhiveis() {
    return this.visiveis.filter((r) => !this.travadas.has(r.id));
  }

  get todasVisiveisMarcadas() {
    const e = this.escolhiveis;
    return e.length > 0 && e.every((r) => this.selecionadas.has(r.id));
  }

  toggle(id: number) {
    if (this.travadas.has(id)) return;
    this.selecionadas.has(id) ? this.selecionadas.delete(id) : this.selecionadas.add(id);
  }

  toggleTodasVisiveis() {
    const marcar = !this.todasVisiveisMarcadas;
    this.escolhiveis.forEach((r) =>
      marcar ? this.selecionadas.add(r.id) : this.selecionadas.delete(r.id),
    );
  }

  get novas(): number[] {
    return [...this.selecionadas].filter((id) => !this.travadas.has(id));
  }

  ok() {
    this.confirmar.emit(this.novas);
  }
}
