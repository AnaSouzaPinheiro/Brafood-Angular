import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AuthService } from '../../services/auth/auth.service';
import {
  AdminCategoriaService,
  CategoriaAdmin,
  SubcategoriaAdmin,
} from '../../services/admin/admin-categoria.service';
import {
  AdminSecaoService,
  SecaoAdmin,
  ReceitaVinculada,
} from '../../services/admin/admin-secao.service';
import { AdminUploadService } from '../../services/admin/admin-upload.service';
import { ModalService } from '../../services/modal/modal.service';

type Tab = 'categorias' | 'subcategorias' | 'secoes';

@Component({
  selector: 'bra-painel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './painel-admin.html',
  styleUrl: './painel-admin.scss',
})
export class PainelAdmin implements OnInit {
  tab: Tab = 'categorias';
  userId!: number;

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

  // Subcategorias
  subcategorias: SubcategoriaAdmin[] = [];
  subcategoriasComReceitas: SubcategoriaAdmin[] = [];

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

  // Seções
  secoes: SecaoAdmin[] = [];

  secForm: Partial<SecaoAdmin> = {};
  secEditId: number | null = null;

  secLoading = false;
  showSecForm = false;

  secTipoFundo: 'imagem' | 'cor' = 'imagem';

  // Upload seções
  previewFundoSecao: string | null = null;
  previewFundoTituloSecao: string | null = null;

  uploadandoFundoSecao = false;
  uploadandoFundoTituloSecao = false;

  // Receitas da seção
  receitasDaSecao: ReceitaVinculada[] = [];
  receitasCarregando = false;

  termoBusca = '';

  sugestoesReceitas: {
    id: number;
    titulo: string;
  }[] = [];

  private buscaSubject = new Subject<string>();

  constructor(
    private auth: AuthService,
    private adminService: AdminCategoriaService,
    private secaoService: AdminSecaoService,
    private uploadService: AdminUploadService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId()!;

    this.carregarCategorias();
    this.carregarSubcategorias();
    this.carregarSecoes();
    this.carregarCategoriasComReceitas();

    this.buscaSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termo) =>
          termo.length >= 2 ? this.secaoService.buscarReceitas(termo) : of([]),
        ),
      )
      .subscribe((res) => {
        this.sugestoesReceitas = res as any[];
      });
  }

  trocarTab(t: Tab) {
    this.tab = t;
    this.fecharForms();
  }

  fecharForms() {
    this.showCatForm = false;
    this.showSubForm = false;
    this.showSecForm = false;

    this.catForm = {};
    this.catEditId = null;

    this.subForm = {
      nome: '',
      id_categoria: null,
    };

    this.subEditId = null;

    this.secForm = {};
    this.secEditId = null;

    this.previewIconeCat = null;
    this.previewFundoCat = null;

    this.previewFundoSecao = null;
    this.previewFundoTituloSecao = null;

    this.receitasDaSecao = [];

    this.sugestoesReceitas = [];
    this.termoBusca = '';
  }

  // Categorias
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
    this.catForm = { ordem: 99 };
    this.showCatForm = true;
    this.previewIconeCat = null;
    this.previewFundoCat = null;
  }

  editarCat(c: CategoriaAdmin) {
    this.catEditId = c.id;
    this.catForm = { ...c };
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
    this.uploadService.uploadImagem(file, 'categorias', this.userId).subscribe({
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
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao salvar categoria.' });
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
            this.carregarSubcategorias();
          },
          error: () => {
            this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao excluir categoria.' });
          },
        });
      },
    });
  }

  // Subcategorias
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
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao salvar subcategoria.' });
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

  // Seções
  carregarSecoes() {
    this.secaoService.listarSecoes().subscribe({
      next: (data) => { this.secoes = data; },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao carregar seções.' });
      },
    });
  }

  abrirNovaSecao() {
    this.secEditId = null;
    this.secForm = {
      ordem: 99,
      url_fundo: null,
      cor_fundo: null,
      modo: 'aleatorio',
      titulo_cor_tipo: 'gradiente',
      titulo_gradiente_1: '#8aabff',
      titulo_gradiente_2: '#0049ff',
    };
    this.secTipoFundo = 'imagem';
    this.showSecForm = true;
    this.previewFundoSecao = null;
    this.previewFundoTituloSecao = null;
    this.receitasDaSecao = [];
  }

  editarSecao(s: SecaoAdmin) {
    this.secEditId = s.id;
    this.secForm = { ...s };
    this.secTipoFundo = s.url_fundo ? 'imagem' : 'cor';
    this.showSecForm = true;
    this.previewFundoSecao = null;
    this.previewFundoTituloSecao = null;

    if (s.modo === 'manual') {
      this.carregarReceitasDaSecao(s.id);
    } else {
      this.receitasDaSecao = [];
    }
  }

  onTipoFundoChange() {
    if (this.secTipoFundo === 'imagem') {
      this.secForm.cor_fundo = null;
    } else {
      this.secForm.url_fundo = null;
    }
  }

  onModoChange() {
    if (this.secForm.modo === 'manual' && this.secEditId) {
      this.carregarReceitasDaSecao(this.secEditId);
    } else {
      this.receitasDaSecao = [];
    }
  }

  onFundoSecaoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => { this.previewFundoSecao = reader.result as string; };
    reader.readAsDataURL(file);

    this.uploadandoFundoSecao = true;
    this.uploadService.uploadImagem(file, 'secoes', this.userId).subscribe({
      next: (res) => {
        this.secForm.url_fundo = res.caminho;
        this.uploadandoFundoSecao = false;
      },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro no upload', message: 'Erro no upload do fundo.' });
        this.uploadandoFundoSecao = false;
      },
    });
  }

  onFundoTituloSecaoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => { this.previewFundoTituloSecao = reader.result as string; };
    reader.readAsDataURL(file);

    this.uploadandoFundoTituloSecao = true;
    this.uploadService.uploadImagem(file, 'secoes', this.userId).subscribe({
      next: (res) => {
        this.secForm.fundo_titulo = res.caminho;
        this.uploadandoFundoTituloSecao = false;
      },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro no upload', message: 'Erro no upload do fundo do título.' });
        this.uploadandoFundoTituloSecao = false;
      },
    });
  }

  getTituloPreviewStyle(): Record<string, string> {
    if (this.secForm.titulo_cor_tipo === 'solido') {
      return { color: this.secForm.titulo_cor_solid || '#0049ff' };
    }

    const c1 = this.secForm.titulo_gradiente_1 || '#8aabff';
    const c2 = this.secForm.titulo_gradiente_2 || '#0049ff';

    return {
      backgroundImage: `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`,
      backgroundClip: 'text',
      webkitBackgroundClip: 'text',
      color: 'transparent',
      webkitTextFillColor: 'transparent',
    };
  }

  onCategoriaSecaoChange() {
    this.secForm.id_subcategoria = null;

    if (this.secForm.id_categoria) {
      this.adminService.listarSubcategoriasComReceitas(this.secForm.id_categoria).subscribe({
        next: (data) => { this.subcategoriasComReceitas = data; },
      });
    } else {
      this.subcategoriasComReceitas = [];
    }
  }

  salvarSecao() {
    if (!this.secForm.titulo?.trim()) {
      this.modalService.open({ type: 'warning', title: 'Atenção', message: 'Título é obrigatório.' });
      return;
    }

    const payload: Partial<SecaoAdmin> = {
      ...this.secForm,
      url_fundo: this.secTipoFundo === 'imagem' ? (this.secForm.url_fundo ?? null) : null,
      cor_fundo: this.secTipoFundo === 'cor'    ? (this.secForm.cor_fundo  ?? null) : null,
    };

    this.secLoading = true;

    const op = this.secEditId
      ? this.secaoService.atualizarSecao(this.secEditId, payload, this.userId)
      : this.secaoService.criarSecao(payload, this.userId);

    op.subscribe({
      next: () => {
        this.modalService.open({
          type: 'success',
          title: this.secEditId ? 'Seção atualizada' : 'Seção criada',
          message: this.secEditId ? 'A seção foi atualizada com sucesso!' : 'A seção foi criada com sucesso!',
        });
        this.secLoading = false;
        this.showSecForm = false;
        this.secForm = {};
        this.secEditId = null;
        this.carregarSecoes();
      },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao salvar seção.' });
        this.secLoading = false;
      },
    });
  }

  excluirSecao(id: number, titulo: string) {
    this.modalService.open({
      type: 'warning',
      title: 'Excluir seção',
      message: `Excluir a seção "${titulo}"?`,
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.secaoService.excluirSecao(id, this.userId).subscribe({
          next: () => {
            this.modalService.open({ type: 'success', title: 'Seção excluída', message: 'Seção removida com sucesso!' });
            this.carregarSecoes();
          },
          error: () => {
            this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao excluir seção.' });
          },
        });
      },
    });
  }

  // Receitas da seção
  carregarReceitasDaSecao(secaoId: number) {
    this.receitasCarregando = true;

    this.secaoService.listarReceitasDaSecao(secaoId).subscribe({
      next: (data) => {
        this.receitasDaSecao = data;
        this.receitasCarregando = false;
      },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao carregar receitas.' });
        this.receitasCarregando = false;
      },
    });
  }

  onTermoBuscaChange() {
    this.buscaSubject.next(this.termoBusca);
  }

  vincularReceita(receita: { id: number; titulo: string }) {
    if (!this.secEditId) return;

    this.secaoService.adicionarReceita(this.secEditId, receita.id, this.userId).subscribe({
      next: () => {
        this.sugestoesReceitas = [];
        this.termoBusca = '';
        this.carregarReceitasDaSecao(this.secEditId!);
      },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao vincular receita.' });
      },
    });
  }

  desvincularReceita(receitaId: number) {
    if (!this.secEditId) return;

    this.secaoService.removerReceita(this.secEditId, receitaId, this.userId).subscribe({
      next: () => { this.carregarReceitasDaSecao(this.secEditId!); },
      error: () => {
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao remover receita.' });
      },
    });
  }

  // Helpers
  nomeDaCategoria(id: number | null): string {
    if (!id) return '—';
    return this.categorias.find((c) => c.id === id)?.nome ?? '—';
  }

  get subcatsFiltradas(): SubcategoriaAdmin[] {
    if (!this.filtroCategoria) return this.subcategorias;
    return this.subcategorias.filter((s) => s.id_categoria === this.filtroCategoria);
  }

  get subcategoriasDaCategoria(): SubcategoriaAdmin[] {
    if (!this.secForm.id_categoria) return [];
    return this.subcategoriasComReceitas.filter((s) => s.id_categoria === this.secForm.id_categoria);
  }
}
