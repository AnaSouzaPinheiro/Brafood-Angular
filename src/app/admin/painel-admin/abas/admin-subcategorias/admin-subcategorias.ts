import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    AdminCategoriaService,
    CategoriaAdmin,
    SubcategoriaAdmin,
} from '../../../../services/admin/admin-categoria.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { LIMITE_NOME } from '../../limites';

/** Aba "Subcategorias" do painel admin. */
@Component({
  selector: 'bra-admin-subcategorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-subcategorias.html',
  styleUrl: './admin-subcategorias.scss',
})
export class AdminSubcategorias implements OnInit {
  readonly LIMITE_NOME = LIMITE_NOME;
  userId!: number;

  categorias: CategoriaAdmin[] = [];
  subcategorias: SubcategoriaAdmin[] = [];

  subForm: {
    nome: string;
    id_categoria: number | null;
  } = {
    nome: '',
    id_categoria: null,
  };

  subEditId: number | null = null;
  subLoading = false;
  showSubForm = false;

  filtroCategoria: number | null = null;

  constructor(
    private auth: AuthService,
    private adminService: AdminCategoriaService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId()!;
    this.adminService.listarCategorias().subscribe({
      next: (data) => { this.categorias = data; },
    });
    this.carregarSubcategorias();
  }

  carregarSubcategorias() {
    this.adminService.listarSubcategorias(this.filtroCategoria ?? undefined).subscribe({
      next: (data) => { this.subcategorias = data; },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao carregar subcategorias.' });
      },
    });
  }

  filtrarPorCategoria() {
    this.carregarSubcategorias();
  }

  abrirNovaSub() {
    this.subEditId = null;
    this.subForm = { nome: '', id_categoria: null };
    this.showSubForm = true;
  }

  editarSub(s: SubcategoriaAdmin) {
    this.subEditId = s.id;
    this.subForm = { nome: s.nome, id_categoria: s.id_categoria };
    this.showSubForm = true;
  }

  salvarSub() {
    if (!this.subForm.nome?.trim() || !this.subForm.id_categoria) {
      this.modalService.open({ type: 'warning', title: 'Atenção', message: 'Nome e categoria são obrigatórios.' });
      return;
    }

    if (this.subForm.nome.trim().length > this.LIMITE_NOME) {
      this.modalService.open({
        type: 'warning',
        title: 'Nome muito longo',
        message: `Use no máximo ${this.LIMITE_NOME} caracteres para o nome caber no menu de categorias.`,
      });
      return;
    }

    this.subLoading = true;

    const op = this.subEditId
      ? this.adminService.atualizarSubcategoria(this.subEditId, this.subForm.nome, this.subForm.id_categoria, this.userId)
      : this.adminService.criarSubcategoria(this.subForm.nome, this.subForm.id_categoria, this.userId);

    op.subscribe({
      next: () => {
        this.modalService.open({
          type: 'success',
          title: this.subEditId ? 'Subcategoria atualizada' : 'Subcategoria criada',
          message: this.subEditId ? 'A subcategoria foi atualizada com sucesso!' : 'A subcategoria foi criada com sucesso!',
        });
        this.subLoading = false;
        this.showSubForm = false;
        this.subForm = { nome: '', id_categoria: null };
        this.subEditId = null;
        this.carregarSubcategorias();
      },
      error: (err) => {
        // 409 = nome repetido: mostra o aviso do servidor
        const repetido = err?.status === 409;
        this.modalService.open({
          type: repetido ? 'warning' : 'error',
          title: repetido ? 'Nome repetido' : 'Erro',
          message: err?.error?.mensagem || 'Erro ao salvar subcategoria.',
        });
        this.subLoading = false;
      },
    });
  }

  excluirSub(id: number, nome: string) {
    this.modalService.open({
      type: 'warning',
      title: 'Excluir subcategoria',
      message: `Excluir a subcategoria "${nome}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.adminService.excluirSubcategoria(id, this.userId).subscribe({
          next: () => {
            this.modalService.open({ type: 'success', title: 'Subcategoria excluída', message: 'Subcategoria removida com sucesso!' });
            this.carregarSubcategorias();
          },
          error: () => {
            this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao excluir subcategoria.' });
          },
        });
      },
    });
  }

  nomeDaCategoria(id: number | null): string {
    if (!id) return '—';
    return this.categorias.find((c) => c.id === id)?.nome ?? '—';
  }

  get subcatsFiltradas(): SubcategoriaAdmin[] {
    if (!this.filtroCategoria) return this.subcategorias;
    return this.subcategorias.filter((s) => s.id_categoria === this.filtroCategoria);
  }
}
