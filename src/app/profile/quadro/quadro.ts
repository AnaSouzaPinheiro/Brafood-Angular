import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { FavoritoService } from '../../services/favorito/favorito.service';
import { ModalService } from '../../services/modal/modal.service';
import { QuadroService } from '../../services/quadro/quadro.service';
import { ToastService } from '../../services/toast/toast.service';
import { RecipeCardSkeleton } from '../../shared/recipe-card-skeleton/recipe-card-skeleton';
import { Perfil } from '../perfil/perfil';

const POR_PAGINA = 6;

/**
 * Receitas de um quadro. `/perfil/favoritas/todas` é o quadro fixo
 * "Favoritos" (todas as salvas); os demais vêm de `quadros`.
 */
@Component({
  selector: 'bra-quadro',
  standalone: true,
  imports: [Perfil, RecipeCard, RecipeCardSkeleton, RouterModule, CommonModule, FormsModule],
  templateUrl: './quadro.html',
  styleUrl: './quadro.scss',
})
export class Quadro implements OnInit {
  idQuadro: number | null = null; // null = Favoritos
  nome = 'Favoritos';
  descricao: string | null = null;
  receitas: any[] = [];
  carregando = true;

  editando = false;
  nomeEdit = '';
  descricaoEdit = '';

  pagina = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quadroService: QuadroService,
    private favoritoService: FavoritoService,
    private modal: ModalService,
    private toast: ToastService,
  ) {}

  ngOnInit(): void {
    if (typeof window === 'undefined') return;

    const param = this.route.snapshot.paramMap.get('id');
    if (param !== 'todas') {
      const id = Number(param);
      if (!id) {
        this.router.navigate(['/perfil/favoritas']);
        return;
      }
      this.idQuadro = id;
    }
    this.carregar();
  }

  get ehFavoritos() {
    return this.idQuadro === null;
  }

  carregar() {
    if (this.ehFavoritos) {
      this.favoritoService.listarFavoritos(0).subscribe({
        next: (data) => this.setReceitas(data),
        error: () => (this.carregando = false),
      });
      return;
    }

    this.quadroService.detalhe(this.idQuadro!).subscribe({
      next: (res) => {
        this.nome = res.quadro.nome;
        this.descricao = res.quadro.descricao;
        this.setReceitas(res.receitas);
      },
      error: () => {
        this.toast.show('Quadro não encontrado', 'error');
        this.router.navigate(['/perfil/favoritas']);
      },
    });
  }

  private setReceitas(data: any) {
    this.receitas = Array.isArray(data) ? data : [];
    this.carregando = false;
    if (this.pagina > this.paginas) this.pagina = Math.max(1, this.paginas);
  }

  // ---- paginação ---------------------------------------------------------
  get receitasPagina() {
    const ini = (this.pagina - 1) * POR_PAGINA;
    return this.receitas.slice(ini, ini + POR_PAGINA);
  }
  get paginas() {
    return Math.ceil(this.receitas.length / POR_PAGINA);
  }
  get paginasArray() {
    return Array.from({ length: this.paginas }, (_, i) => i + 1);
  }
  irPara(p: number) {
    if (this.paginas === 0) return;
    if (p < 1) p = this.paginas;
    if (p > this.paginas) p = 1;
    this.pagina = p;
  }

  // ---- editar / excluir quadro ---------------------------------------
  abrirEdicao() {
    this.nomeEdit = this.nome;
    this.descricaoEdit = this.descricao ?? '';
    this.editando = true;
  }

  salvarEdicao() {
    const nome = this.nomeEdit.trim();
    if (!nome || this.idQuadro === null) return;
    const descricao = this.descricaoEdit.trim() || null;

    this.quadroService.editar(this.idQuadro, nome, descricao).subscribe({
      next: () => {
        this.nome = nome;
        this.descricao = descricao;
        this.editando = false;
      },
      error: (err) => this.toast.show(err?.error?.error ?? 'Erro ao salvar', 'error'),
    });
  }

  excluirQuadro() {
    if (this.idQuadro === null) return;
    const id = this.idQuadro;
    this.modal.open({
      type: 'confirm',
      title: 'Excluir quadro',
      message: `Excluir o quadro "${this.nome}"? As receitas continuam nos seus Favoritos.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.quadroService.excluir(id).subscribe({
          next: () => {
            this.toast.show('Quadro excluído', 'success');
            this.router.navigate(['/perfil/favoritas']);
          },
          error: () => this.toast.show('Erro ao excluir quadro', 'error'),
        });
      },
    });
  }

  // ---- remover receita -------------------------------------------------
  remover(receita: any) {
    const idReceita = Number(receita.id);

    if (this.ehFavoritos) {
      this.modal.open({
        type: 'confirm',
        title: 'Remover dos favoritos',
        message: 'A receita também sairá de todos os seus quadros. Continuar?',
        confirmText: 'Remover',
        cancelText: 'Cancelar',
        onConfirm: () =>
          this.favoritoService.desfavoritar(0, idReceita).subscribe(() => this.tirarDaLista(idReceita)),
      });
      return;
    }

    this.quadroService
      .removerReceita(this.idQuadro!, idReceita)
      .subscribe(() => this.tirarDaLista(idReceita));
  }

  private tirarDaLista(idReceita: number) {
    this.setReceitas(this.receitas.filter((r) => Number(r.id) !== idReceita));
  }
}
