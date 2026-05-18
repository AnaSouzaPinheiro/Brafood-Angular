import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
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

  // ── Categorias ──────────────────────────────────────────
  categorias: CategoriaAdmin[] = [];
  catForm: Partial<CategoriaAdmin> = {};
  catEditId: number | null = null;
  catLoading = false;
  catMsg = '';
  catMsgErro = false;
  showCatForm = false;

  // Upload de imagens — categorias
  previewIconeCat: string | null = null;
  previewFundoCat: string | null = null;
  uploadandoIconeCat = false;
  uploadandoFundoCat = false;

  // ── Subcategorias ────────────────────────────────────────
  subcategorias: SubcategoriaAdmin[] = [];
  subForm: { nome: string; id_categoria: number | null } = {
    nome: '',
    id_categoria: null,
  };
  subEditId: number | null = null;
  subLoading = false;
  subMsg = '';
  subMsgErro = false;
  showSubForm = false;
  filtroCategoria: number | null = null;

  // ── Seções da Home ───────────────────────────────────────
  secoes: SecaoAdmin[] = [];
  secForm: Partial<SecaoAdmin> = {};
  secEditId: number | null = null;
  secLoading = false;
  secMsg = '';
  secMsgErro = false;
  showSecForm = false;
  secTipoFundo: 'imagem' | 'cor' = 'imagem';

  // Upload de imagens — seções
  previewFundoSecao: string | null = null;
  previewFundoTituloSecao: string | null = null;
  uploadandoFundoSecao = false;
  uploadandoFundoTituloSecao = false;

  // ── Gestão de receitas da seção ──────────────────────────
  receitasDaSecao: ReceitaVinculada[] = [];
  receitasCarregando = false;
  termoBusca = '';
  sugestoesReceitas: { id: number; titulo: string }[] = [];
  private buscaSubject = new Subject<string>();

  constructor(
    private auth: AuthService,
    private adminService: AdminCategoriaService,
    private secaoService: AdminSecaoService,
    private uploadService: AdminUploadService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId()!;
    this.carregarCategorias();
    this.carregarSubcategorias();
    this.carregarSecoes();

    // Debounce na busca de receitas
    this.buscaSubject
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termo) =>
          termo.length >= 2 ? this.secaoService.buscarReceitas(termo) : [],
        ),
      )
      .subscribe((res) => (this.sugestoesReceitas = res as any[]));
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
    this.subForm = { nome: '', id_categoria: null };
    this.subEditId = null;
    this.secForm = {};
    this.secEditId = null;
    this.catMsg = '';
    this.subMsg = '';
    this.secMsg = '';
    this.previewIconeCat = null;
    this.previewFundoCat = null;
    this.previewFundoSecao = null;
    this.previewFundoTituloSecao = null;
    this.receitasDaSecao = [];
    this.sugestoesReceitas = [];
    this.termoBusca = '';
  }

  // ── Categorias ──────────────────────────────────────────
  carregarCategorias() {
    this.adminService.listarCategorias().subscribe({
      next: (data) => (this.categorias = data),
      error: () => this.setMsg('cat', 'Erro ao carregar categorias.', true),
    });
  }

  abrirNovaCat() {
    this.catEditId = null;
    this.catForm = { ordem: 99 };
    this.showCatForm = true;
    this.catMsg = '';
    this.previewIconeCat = null;
    this.previewFundoCat = null;
  }

  editarCat(c: CategoriaAdmin) {
    this.catEditId = c.id;
    this.catForm = { ...c };
    this.showCatForm = true;
    this.catMsg = '';
    this.previewIconeCat = null;
    this.previewFundoCat = null;
  }

  onIconeCatChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.previewIconeCat = reader.result as string);
    reader.readAsDataURL(file);
    this.uploadandoIconeCat = true;
    this.uploadService.uploadImagem(file, 'categorias', this.userId).subscribe({
      next: (res) => {
        this.catForm.icone = res.caminho;
        this.uploadandoIconeCat = false;
      },
      error: () => {
        this.setMsg('cat', 'Erro no upload do ícone.', true);
        this.uploadandoIconeCat = false;
      },
    });
  }

  onFundoCatChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => (this.previewFundoCat = reader.result as string);
    reader.readAsDataURL(file);
    this.uploadandoFundoCat = true;
    this.uploadService.uploadImagem(file, 'categorias', this.userId).subscribe({
      next: (res) => {
        this.catForm.fundo = res.caminho;
        this.uploadandoFundoCat = false;
      },
      error: () => {
        this.setMsg('cat', 'Erro no upload do fundo.', true);
        this.uploadandoFundoCat = false;
      },
    });
  }

  salvarCat() {
    if (!this.catForm.nome?.trim()) {
      this.setMsg('cat', 'Nome é obrigatório.', true);
      return;
    }
    this.catLoading = true;
    const op = this.catEditId
      ? this.adminService.atualizarCategoria(
          this.catEditId,
          this.catForm,
          this.userId,
        )
      : this.adminService.criarCategoria(this.catForm, this.userId);
    op.subscribe({
      next: () => {
        this.setMsg(
          'cat',
          this.catEditId ? 'Categoria atualizada!' : 'Categoria criada!',
          false,
        );
        this.catLoading = false;
        this.showCatForm = false;
        this.catForm = {};
        this.catEditId = null;
        this.carregarCategorias();
      },
      error: () => {
        this.setMsg('cat', 'Erro ao salvar categoria.', true);
        this.catLoading = false;
      },
    });
  }

  excluirCat(id: number, nome: string) {
    if (
      !confirm(
        `Excluir a categoria "${nome}"? Isso também excluirá todas as subcategorias vinculadas.`,
      )
    )
      return;
    this.adminService.excluirCategoria(id, this.userId).subscribe({
      next: () => {
        this.setMsg('cat', 'Categoria excluída.', false);
        this.carregarCategorias();
        this.carregarSubcategorias();
      },
      error: () => this.setMsg('cat', 'Erro ao excluir.', true),
    });
  }

  // ── Subcategorias ────────────────────────────────────────
  carregarSubcategorias() {
    this.adminService
      .listarSubcategorias(this.filtroCategoria ?? undefined)
      .subscribe({
        next: (data) => (this.subcategorias = data),
        error: () =>
          this.setMsg('sub', 'Erro ao carregar subcategorias.', true),
      });
  }

  filtrarPorCategoria() {
    this.carregarSubcategorias();
  }

  abrirNovaSub() {
    this.subEditId = null;
    this.subForm = { nome: '', id_categoria: null };
    this.showSubForm = true;
    this.subMsg = '';
  }

  editarSub(s: SubcategoriaAdmin) {
    this.subEditId = s.id;
    this.subForm = { nome: s.nome, id_categoria: s.id_categoria };
    this.showSubForm = true;
    this.subMsg = '';
  }

  salvarSub() {
    if (!this.subForm.nome?.trim() || !this.subForm.id_categoria) {
      this.setMsg('sub', 'Nome e categoria são obrigatórios.', true);
      return;
    }
    this.subLoading = true;
    const op = this.subEditId
      ? this.adminService.atualizarSubcategoria(
          this.subEditId,
          this.subForm.nome,
          this.subForm.id_categoria,
          this.userId,
        )
      : this.adminService.criarSubcategoria(
          this.subForm.nome,
          this.subForm.id_categoria,
          this.userId,
        );
    op.subscribe({
      next: () => {
        this.setMsg(
          'sub',
          this.subEditId ? 'Subcategoria atualizada!' : 'Subcategoria criada!',
          false,
        );
        this.subLoading = false;
        this.showSubForm = false;
        this.subForm = { nome: '', id_categoria: null };
        this.subEditId = null;
        this.carregarSubcategorias();
      },
      error: () => {
        this.setMsg('sub', 'Erro ao salvar subcategoria.', true);
        this.subLoading = false;
      },
    });
  }

  excluirSub(id: number, nome: string) {
    if (!confirm(`Excluir a subcategoria "${nome}"?`)) return;
    this.adminService.excluirSubcategoria(id, this.userId).subscribe({
      next: () => {
        this.setMsg('sub', 'Subcategoria excluída.', false);
        this.carregarSubcategorias();
      },
      error: () => this.setMsg('sub', 'Erro ao excluir.', true),
    });
  }

  // ── Seções da Home ───────────────────────────────────────
  carregarSecoes() {
    this.secaoService.listarSecoes().subscribe({
      next: (data) => (this.secoes = data),
      error: () => this.setMsg('sec', 'Erro ao carregar seções.', true),
    });
  }

  abrirNovaSecao() {
    this.secEditId = null;
    this.secForm = {
      ordem: 99,
      url_fundo: null,
      cor_fundo: null,
      modo: 'aleatorio',
    };
    this.secTipoFundo = 'imagem';
    this.showSecForm = true;
    this.secMsg = '';
    this.previewFundoSecao = null;
    this.previewFundoTituloSecao = null;
    this.receitasDaSecao = [];
  }

  editarSecao(s: SecaoAdmin) {
    this.secEditId = s.id;
    this.secForm = { ...s };
    this.secTipoFundo = s.url_fundo ? 'imagem' : 'cor';
    this.showSecForm = true;
    this.secMsg = '';
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
    reader.onload = () => (this.previewFundoSecao = reader.result as string);
    reader.readAsDataURL(file);
    this.uploadandoFundoSecao = true;
    this.uploadService.uploadImagem(file, 'secoes', this.userId).subscribe({
      next: (res) => {
        this.secForm.url_fundo = res.caminho;
        this.uploadandoFundoSecao = false;
      },
      error: () => {
        this.setMsg('sec', 'Erro no upload do fundo.', true);
        this.uploadandoFundoSecao = false;
      },
    });
  }

  onFundoTituloSecaoChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () =>
      (this.previewFundoTituloSecao = reader.result as string);
    reader.readAsDataURL(file);
    this.uploadandoFundoTituloSecao = true;
    this.uploadService.uploadImagem(file, 'secoes', this.userId).subscribe({
      next: (res) => {
        this.secForm.fundo_titulo = res.caminho;
        this.uploadandoFundoTituloSecao = false;
      },
      error: () => {
        this.setMsg('sec', 'Erro no upload do fundo do título.', true);
        this.uploadandoFundoTituloSecao = false;
      },
    });
  }

  onCategoriaSecaoChange() {
    this.secForm.id_subcategoria = null;
  }

  salvarSecao() {
    if (!this.secForm.titulo?.trim()) {
      this.setMsg('sec', 'Título é obrigatório.', true);
      return;
    }
    const payload: Partial<SecaoAdmin> = {
      ...this.secForm,
      url_fundo:
        this.secTipoFundo === 'imagem'
          ? (this.secForm.url_fundo ?? null)
          : null,
      cor_fundo:
        this.secTipoFundo === 'cor' ? (this.secForm.cor_fundo ?? null) : null,
    };
    this.secLoading = true;
    const op = this.secEditId
      ? this.secaoService.atualizarSecao(this.secEditId, payload, this.userId)
      : this.secaoService.criarSecao(payload, this.userId);
    op.subscribe({
      next: () => {
        this.setMsg(
          'sec',
          this.secEditId ? 'Seção atualizada!' : 'Seção criada!',
          false,
        );
        this.secLoading = false;
        this.showSecForm = false;
        this.secForm = {};
        this.secEditId = null;
        this.carregarSecoes();
      },
      error: () => {
        this.setMsg('sec', 'Erro ao salvar seção.', true);
        this.secLoading = false;
      },
    });
  }

  excluirSecao(id: number, titulo: string) {
    if (!confirm(`Excluir a seção "${titulo}"?`)) return;
    this.secaoService.excluirSecao(id, this.userId).subscribe({
      next: () => {
        this.setMsg('sec', 'Seção excluída.', false);
        this.carregarSecoes();
      },
      error: () => this.setMsg('sec', 'Erro ao excluir.', true),
    });
  }

  // ── Gestão de receitas da seção ──────────────────────────
  carregarReceitasDaSecao(secaoId: number) {
    this.receitasCarregando = true;
    this.secaoService.listarReceitasDaSecao(secaoId).subscribe({
      next: (data) => {
        this.receitasDaSecao = data;
        this.receitasCarregando = false;
      },
      error: () => {
        this.setMsg('sec', 'Erro ao carregar receitas.', true);
        this.receitasCarregando = false;
      },
    });
  }

  onTermoBuscaChange() {
    this.buscaSubject.next(this.termoBusca);
  }

  vincularReceita(receita: { id: number; titulo: string }) {
    if (!this.secEditId) return;
    this.secaoService
      .adicionarReceita(this.secEditId, receita.id, this.userId)
      .subscribe({
        next: () => {
          this.sugestoesReceitas = [];
          this.termoBusca = '';
          this.carregarReceitasDaSecao(this.secEditId!);
        },
        error: () => this.setMsg('sec', 'Erro ao vincular receita.', true),
      });
  }

  desvincularReceita(receitaId: number) {
    if (!this.secEditId) return;
    this.secaoService
      .removerReceita(this.secEditId, receitaId, this.userId)
      .subscribe({
        next: () => this.carregarReceitasDaSecao(this.secEditId!),
        error: () => this.setMsg('sec', 'Erro ao remover receita.', true),
      });
  }

  // ── Helpers ──────────────────────────────────────────────
  setMsg(scope: 'cat' | 'sub' | 'sec', msg: string, erro: boolean) {
    if (scope === 'cat') {
      this.catMsg = msg;
      this.catMsgErro = erro;
    } else if (scope === 'sub') {
      this.subMsg = msg;
      this.subMsgErro = erro;
    } else {
      this.secMsg = msg;
      this.secMsgErro = erro;
    }
  }

  nomeDaCategoria(id: number | null): string {
    if (!id) return '—';
    return this.categorias.find((c) => c.id === id)?.nome ?? '—';
  }

  get subcatsFiltradas(): SubcategoriaAdmin[] {
    if (!this.filtroCategoria) return this.subcategorias;
    return this.subcategorias.filter(
      (s) => s.id_categoria === this.filtroCategoria,
    );
  }

  get subcategoriasDaCategoria(): SubcategoriaAdmin[] {
    if (!this.secForm.id_categoria) return [];

    return this.subcategorias.filter(
      (s) => s.id_categoria === this.secForm.id_categoria,
    );
  }
}
