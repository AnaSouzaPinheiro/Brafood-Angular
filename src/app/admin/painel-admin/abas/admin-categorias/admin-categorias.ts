import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
    AdminCategoriaService,
    CategoriaAdmin,
} from '../../../../services/admin/admin-categoria.service';
import { AdminUploadService } from '../../../../services/admin/admin-upload.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { LIMITE_NOME } from '../../limites';

const COR_PADRAO = '#8BACFF';

/** Gradiente do hover: a cor em cima, 40% mais escura embaixo
 *  (#8BACFF → #536799, o mesmo padrão das categorias existentes). */
function gradienteDe(cor: string): string {
  const hex = /^#?([0-9a-f]{6})$/i.exec(cor.trim())?.[1];
  if (!hex) return '';
  const escura = [0, 2, 4]
    .map((i) => Math.round(parseInt(hex.slice(i, i + 2), 16) * 0.6).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `linear-gradient(180deg, #${hex.toUpperCase()} 0%, #${escura} 100%)`;
}

/** Aba "Categorias" do painel admin. */
@Component({
  selector: 'bra-admin-categorias',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-categorias.html',
  styleUrl: './admin-categorias.scss',
})
export class AdminCategorias implements OnInit {
  readonly LIMITE_NOME = LIMITE_NOME;
  userId!: number;

  /** true quando o gradiente do hover foi digitado à mão. */
  gradienteManual = false;

  mudarCor(cor: string) {
    this.catForm.cor_primaria = cor;
    if (!this.gradienteManual) this.gerarGradiente();
  }

  /** As duas cores do gradiente (cima, baixo), lidas do CSS salvo. */
  get coresGradiente(): [string, string] {
    const hexes = (this.catForm.gradiente_hover || '').match(/#[0-9a-f]{6}/gi) ?? [];
    const base = this.catForm.cor_primaria || COR_PADRAO;
    const auto = gradienteDe(base).match(/#[0-9a-f]{6}/gi) ?? [base, base];
    return [hexes[0] ?? auto[0], hexes[1] ?? auto[1]];
  }

  mudarCorGradiente(i: 0 | 1, cor: string) {
    const cores = [...this.coresGradiente];
    cores[i] = cor.toUpperCase();
    this.catForm.gradiente_hover = `linear-gradient(180deg, ${cores[0]} 0%, ${cores[1]} 100%)`;
    this.gradienteManual = true;
  }

  gerarGradiente() {
    this.catForm.gradiente_hover = gradienteDe(this.catForm.cor_primaria || COR_PADRAO);
    this.gradienteManual = false;
  }

  // Categorias
  categorias: CategoriaAdmin[] = [];
  categoriasComReceitas: CategoriaAdmin[] = [];

  catForm: Partial<CategoriaAdmin> = {};
  catEditId: number | null = null;
  catLoading = false;
  showCatForm = false;

  // Upload categorias
  previewIconeCat: string | null = null;
  previewFundoCat: string | null = null;

  uploadandoIconeCat = false;
  uploadandoFundoCat = false;

  constructor(
    private auth: AuthService,
    private adminService: AdminCategoriaService,
    private uploadService: AdminUploadService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId()!;
    this.carregarCategorias();
  }

  carregarCategorias() {
    this.adminService.listarCategorias().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: () => {
        this.modalService.open({
          type: 'error',
          title: 'Erro',
          message: 'Erro ao carregar categorias.',
        });
      },
    });
  }

  carregarCategoriasComReceitas() {
    this.adminService.listarCategoriasComReceitas().subscribe({
      next: (data) => {
        this.categoriasComReceitas = data;
      },
    });
  }

  abrirNovaCat() {
    this.catEditId = null;
    this.catForm = { ordem: 99, cor_primaria: COR_PADRAO };
    this.gerarGradiente();
    this.showCatForm = true;
    this.previewIconeCat = null;
    this.previewFundoCat = null;
  }

  editarCat(c: CategoriaAdmin) {
    this.catEditId = c.id;
    this.catForm = { ...c };
    this.gradienteManual =
      !!c.gradiente_hover && c.gradiente_hover !== gradienteDe(c.cor_primaria || COR_PADRAO);
    if (!c.gradiente_hover) this.gerarGradiente();
    this.showCatForm = true;
    this.previewIconeCat = null;
    this.previewFundoCat = null;
  }

  onIconeCatChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => { this.previewIconeCat = reader.result as string; };
    reader.readAsDataURL(file);

    this.uploadandoIconeCat = true;
    this.uploadService.uploadImagem(file, 'icone', this.userId).subscribe({
      next: (res) => {
        this.catForm.icone = res.caminho;
        this.uploadandoIconeCat = false;
      },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro no upload', message: 'Erro no upload do ícone.' });
        this.uploadandoIconeCat = false;
      },
    });
  }

  onFundoCatChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => { this.previewFundoCat = reader.result as string; };
    reader.readAsDataURL(file);

    this.uploadandoFundoCat = true;
    this.uploadService.uploadImagem(file, 'categorias', this.userId).subscribe({
      next: (res) => {
        this.catForm.fundo = res.caminho;
        this.uploadandoFundoCat = false;
      },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro no upload', message: 'Erro no upload do fundo.' });
        this.uploadandoFundoCat = false;
      },
    });
  }

  salvarCat() {
    if (!this.catForm.nome?.trim()) {
      this.modalService.open({ type: 'warning', title: 'Atenção', message: 'Nome é obrigatório.' });
      return;
    }

    if (this.catForm.nome.trim().length > this.LIMITE_NOME) {
      this.modalService.open({
        type: 'warning',
        title: 'Nome muito longo',
        message: `Use no máximo ${this.LIMITE_NOME} caracteres para o nome caber no menu de categorias.`,
      });
      return;
    }

    this.catLoading = true;

    const op = this.catEditId
      ? this.adminService.atualizarCategoria(this.catEditId, this.catForm, this.userId)
      : this.adminService.criarCategoria(this.catForm, this.userId);

    op.subscribe({
      next: () => {
        this.modalService.open({
          type: 'success',
          title: this.catEditId ? 'Categoria atualizada' : 'Categoria criada',
          message: this.catEditId ? 'A categoria foi atualizada com sucesso!' : 'A categoria foi criada com sucesso!',
        });
        this.catLoading = false;
        this.showCatForm = false;
        this.catForm = {};
        this.catEditId = null;
        this.carregarCategorias();
      },
      error: (err) => {
        // 409 = nome repetido: mostra o aviso do servidor
        const repetido = err?.status === 409;
        this.modalService.open({
          type: repetido ? 'warning' : 'error',
          title: repetido ? 'Nome repetido' : 'Erro',
          message: err?.error?.mensagem || 'Erro ao salvar categoria.',
        });
        this.catLoading = false;
      },
    });
  }

  excluirCat(id: number, nome: string) {
    this.modalService.open({
      type: 'warning',
      title: 'Excluir categoria',
      message: `Excluir a categoria "${nome}"? Isso também excluirá todas as subcategorias vinculadas.`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.adminService.excluirCategoria(id, this.userId).subscribe({
          next: () => {
            this.modalService.open({ type: 'success', title: 'Categoria excluída', message: 'Categoria excluída com sucesso!' });
            this.carregarCategorias();
          },
          error: () => {
            this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao excluir categoria.' });
          },
        });
      },
    });
  }
}
