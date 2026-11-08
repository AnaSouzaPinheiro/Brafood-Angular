import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { FavoritoService } from '../../services/favorito/favorito.service';
import { QuadroResumo, QuadroService } from '../../services/quadro/quadro.service';
import { ToastService } from '../../services/toast/toast.service';

/**
 * Menu "Salvar em…" da página da receita: Favoritos (genérico),
 * quadros do usuário e criação de quadro novo.
 * Salvar num quadro também favorita; tirar dos Favoritos tira de todos.
 */
@Component({
  selector: 'bra-salvar-em',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './salvar-em.html',
  styleUrl: './salvar-em.scss',
})
export class SalvarEm implements OnInit {
  @Input({ required: true }) idReceita!: number;
  @Input() favorito = false;
  @Output() favoritoChange = new EventEmitter<boolean>();
  @Output() fechar = new EventEmitter<void>();

  quadros: QuadroResumo[] = [];
  selecionados = new Set<number>();
  carregando = true;
  ocupado = false;

  criando = false;
  novoNome = '';

  constructor(
    private el: ElementRef<HTMLElement>,
    private quadroService: QuadroService,
    private favoritoService: FavoritoService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    forkJoin({
      lista: this.quadroService.listar(),
      estado: this.quadroService.estadoDaReceita(this.idReceita),
    }).subscribe({
      next: ({ lista, estado }) => {
        this.quadros = lista.quadros;
        this.selecionados = new Set(estado.quadros);
        this.setFavorito(estado.favorito);
        this.carregando = false;
      },
      error: () => {
        this.carregando = false;
        this.toast.show('Não foi possível carregar seus quadros', 'error');
      },
    });
  }

  @HostListener('document:click', ['$event'])
  onDocClick(ev: MouseEvent) {
    if (!this.el.nativeElement.contains(ev.target as Node)) this.fechar.emit();
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    this.fechar.emit();
  }

  private setFavorito(v: boolean) {
    if (this.favorito !== v) {
      this.favorito = v;
      this.favoritoChange.emit(v);
    }
  }

  toggleFavoritos() {
    if (this.ocupado) return;
    this.ocupado = true;

    if (this.favorito) {
      this.favoritoService.desfavoritar(0, this.idReceita).subscribe({
        next: () => {
          this.setFavorito(false);
          this.selecionados.clear(); // saiu de todos os quadros
          this.ocupado = false;
        },
        error: () => (this.ocupado = false),
      });
    } else {
      this.favoritoService.favoritar(0, this.idReceita).subscribe({
        next: () => {
          this.setFavorito(true);
          this.toast.show('Salva nos Favoritos! <i class="fa-solid fa-heart"></i>', 'success');
          this.ocupado = false;
        },
        error: () => (this.ocupado = false),
      });
    }
  }

  toggleQuadro(q: QuadroResumo) {
    if (this.ocupado) return;
    this.ocupado = true;

    if (this.selecionados.has(q.id)) {
      this.quadroService.removerReceita(q.id, this.idReceita).subscribe({
        next: () => {
          this.selecionados.delete(q.id);
          this.ocupado = false;
        },
        error: () => (this.ocupado = false),
      });
    } else {
      this.quadroService.adicionarReceita(q.id, this.idReceita).subscribe({
        next: () => {
          this.selecionados.add(q.id);
          this.setFavorito(true);
          this.toast.show(`Salva em "${q.nome}"`, 'success');
          this.ocupado = false;
        },
        error: () => {
          this.ocupado = false;
          this.toast.show('Erro ao salvar no quadro', 'error');
        },
      });
    }
  }

  criarQuadro() {
    const nome = this.novoNome.trim();
    if (!nome || this.ocupado) return;
    this.ocupado = true;

    this.quadroService.criar(nome, null, this.idReceita).subscribe({
      next: (res) => {
        if (res.id) {
          this.quadros = [{ id: res.id, nome, descricao: null, total: 1, capas: [] }, ...this.quadros];
          this.selecionados.add(res.id);
        }
        this.setFavorito(true);
        this.toast.show(`Quadro "${nome}" criado!`, 'success');
        this.novoNome = '';
        this.criando = false;
        this.ocupado = false;
      },
      error: (err) => {
        this.ocupado = false;
        this.toast.show(err?.error?.error ?? 'Erro ao criar quadro', 'error');
      },
    });
  }
}
