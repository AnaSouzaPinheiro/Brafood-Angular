import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import {
    AdminCategoriaService,
    CategoriaAdmin,
    SubcategoriaAdmin,
} from '../../services/admin/admin-categoria.service';
import {
    AdminSecaoService,
    ReceitaVinculada,
    SecaoAdmin,
} from '../../services/admin/admin-secao.service';
import { AdminUploadService } from '../../services/admin/admin-upload.service';
import { AuthService } from '../../services/auth/auth.service';
import { DestaqueService } from '../../services/destaque/destaque.service';
import { ModalService } from '../../services/modal/modal.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';

type Tab = 'categorias' | 'subcategorias' | 'secoes' | 'destaque';

@Component({
  selector: 'bra-painel-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  templateUrl: './painel-admin.html',
  styleUrls: ['./painel-admin.scss', './painel-admin-imagens.scss'],
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
  // Período sazonal digitado como DD/MM (convertido para MM-DD ao salvar)
  secPeriodoDe = '';
  secPeriodoAte = '';
  readonly hojeIso = new Date().toISOString().slice(0, 10);
  secEditId: number | null = null;

  secLoading = false;
  showSecForm = false;

  secTipoFundo: 'imagem' | 'cor' = 'imagem';

  // Destaque da semana
  destaqueAtual: any = null;
  destaqueReceitas: any[] = [];
  destaqueBusca = '';
  destaqueLoading = false;
  private destaqueBuscaSubject = new Subject<string>();

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
    private destaqueService: DestaqueService,
  ) {}

  ngOnInit(): void {
    this.userId = this.auth.getUserId()!;

    this.carregarCategorias();
    this.carregarDestaque();

    this.destaqueBuscaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((t) => t.length >= 2 ? this.destaqueService.buscarReceitas(t) : of([])),
    ).subscribe((res) => { this.destaqueReceitas = res; });
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

  // ── Destaque ──────────────────────────────────────────────────────────────

  carregarDestaque() {
    this.destaqueService.buscar().subscribe({
      next: (d) => { this.destaqueAtual = d; },
      error: () => { this.destaqueAtual = null; },
    });
  }

  onDestaqueBuscaChange() {
    this.destaqueBuscaSubject.next(this.destaqueBusca);
  }

  ativarDestaque(receita: any) {
    this.destaqueLoading = true;
    this.destaqueService.ativar(receita.id, this.userId).subscribe({
      next: () => {
        this.destaqueLoading = false;
        this.destaqueBusca = '';
        this.destaqueReceitas = [];
        this.carregarDestaque();
        this.modalService.open({ type: 'success', title: 'Destaque ativado', message: `"${receita.titulo}" é a nova receita da semana!` });
      },
      error: () => {
        this.destaqueLoading = false;
        this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao ativar destaque.' });
      },
    });
  }

  removerDestaque() {
    this.modalService.open({
      type: 'warning',
      title: 'Voltar para automático',
      message: 'Desfazer a escolha desta semana? Uma receita será escolhida automaticamente.',
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.destaqueService.remover(this.userId).subscribe({
          next: () => {
            this.destaqueAtual = null;
            this.modalService.open({ type: 'success', title: 'Pronto', message: 'A receita da semana voltou a ser escolhida automaticamente.' });
          },
          error: () => {
            this.modalService.open({ type: 'error', title: 'Erro', message: 'Erro ao remover destaque.' });
          },
        });
      },
    });
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
    this.secPeriodoDe = '';
    this.secPeriodoAte = '';

    this.previewIconeCat = null;
    this.previewFundoCat = null;

    this.previewFundoSecao = null;
    this.previewFundoTituloSecao = null;
    this.resetIa();

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
    this.carregarDestaque();

    this.destaqueBuscaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((t) => t.length >= 2 ? this.destaqueService.buscarReceitas(t) : of([])),
    ).subscribe((res) => { this.destaqueReceitas = res; });
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
    this.carregarDestaque();

    this.destaqueBuscaSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((t) => t.length >= 2 ? this.destaqueService.buscarReceitas(t) : of([])),
    ).subscribe((res) => { this.destaqueReceitas = res; });
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
    this.secPeriodoDe = '';
    this.secPeriodoAte = '';
    this.secForm = {
      ordem: 99,
      url_fundo: null,
      cor_fundo: null,
      modo: 'aleatorio',
      card_exibir: 'categoria',
      titulo_cor_tipo: 'gradiente',
      titulo_gradiente_1: '#8aabff',
      titulo_gradiente_2: '#0049ff',
    };
    this.secTipoFundo = 'imagem';
    this.showSecForm = true;
    this.previewFundoSecao = null;
    this.previewFundoTituloSecao = null;
    this.resetIa();
    this.receitasDaSecao = [];
  }

  editarSecao(s: SecaoAdmin) {
    this.secEditId = s.id;
    this.secForm = { ...s };
    this.secPeriodoDe = this.mesDiaParaDiaMes(s.ativo_de);
    this.secPeriodoAte = this.mesDiaParaDiaMes(s.ativo_ate);
    this.secTipoFundo = s.url_fundo ? 'imagem' : 'cor';
    this.showSecForm = true;
    this.previewFundoSecao = null;
    this.previewFundoTituloSecao = null;
    this.resetIa();

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
    delete this.iaSelecionada.fundo;
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
    delete this.iaSelecionada.titulo;
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

  // ── Geração de imagem com IA (fundo da seção / fundo do título) ──────────

  readonly IA_QTD_OPCOES = 2;
  readonly IA_MAX_CORES = 3;

  iaTipo: 'fundo' | 'titulo' | null = null;
  iaTema = '';
  iaIcones = '';
  iaCores: string[] = ['#8b5cf6'];
  iaSugerindo = false;
  /** Opções geradas por campo — ficam disponíveis até salvar/fechar a seção. */
  iaOpcoes: Record<'fundo' | 'titulo', { src: string | null; erro: boolean }[]> = { fundo: [], titulo: [] };
  /** Opção escolhida (data URL) ainda não enviada; o upload acontece ao salvar. */
  iaSelecionada: Partial<Record<'fundo' | 'titulo', string>> = {};

  /** Zera a geração com IA ao abrir/fechar o formulário de seção. */
  resetIa() {
    this.iaTipo = null;
    this.iaIcones = '';
    this.iaOpcoes = { fundo: [], titulo: [] };
    this.iaSelecionada = {};
  }

  abrirIa(tipo: 'fundo' | 'titulo') {
    if (this.iaTipo === tipo) { this.iaTipo = null; return; }
    this.iaTipo = tipo;
    this.iaTema = this.secForm.titulo || '';
    if (!this.iaIcones) {
      const corTitulo = this.secForm.titulo_cor_tipo === 'solido'
        ? this.secForm.titulo_cor_solid
        : this.secForm.titulo_gradiente_2;
      if (corTitulo && /^#[0-9a-f]{6}$/i.test(corTitulo)) this.iaCores = [corTitulo];
      this.sugerirIconesIa();
    }
  }

  adicionarCorIa() {
    if (this.iaCores.length < this.IA_MAX_CORES) this.iaCores = [...this.iaCores, '#f5b700'];
  }

  removerCorIa(i: number) {
    if (this.iaCores.length > 1) this.iaCores = this.iaCores.filter((_, idx) => idx !== i);
  }

  trocarCorIa(i: number, cor: string) {
    this.iaCores = this.iaCores.map((c, idx) => (idx === i ? cor : c));
  }

  /** Contexto para a IA: receitas vinculadas (manual) ou categoria/subcategoria. */
  private contextoIa(): string {
    if (this.secForm.modo === 'manual' && this.receitasDaSecao.length) {
      return this.receitasDaSecao.map(r => r.titulo).join(', ');
    }
    const cat = this.categorias.find(c => c.id == this.secForm.id_categoria)?.nome;
    const sub = this.subcategorias.find(s => s.id == this.secForm.id_subcategoria)?.nome;
    return [cat, sub].filter(Boolean).join(', ');
  }

  /** IA sugere ícones e uma paleta de cores combinando com o tema. */
  sugerirIconesIa() {
    if (!this.iaTema.trim()) return;
    this.iaSugerindo = true;
    this.uploadService.sugerirIconesIa(this.iaTema, this.contextoIa(), this.userId).subscribe({
      next: (res) => {
        this.iaIcones = res.icones;
        if (res.cores?.length) this.iaCores = res.cores.slice(0, this.IA_MAX_CORES);
        this.iaSugerindo = false;
      },
      error: () => {
        this.iaSugerindo = false;
        this.modalService.open({
          type: 'warning',
          title: 'Sugestão indisponível',
          message: 'A IA não respondeu agora. Tente de novo ou escreva os ícones (em inglês, separados por vírgula).',
        });
      },
    });
  }

  gerarOpcoesIa() {
    if (!this.iaTipo || !this.iaTema.trim()) return;
    const tipo = this.iaTipo;
    const opcoes = Array.from({ length: this.IA_QTD_OPCOES }, () => ({ src: null as string | null, erro: false }));
    this.iaOpcoes = { ...this.iaOpcoes, [tipo]: opcoes };
    opcoes.forEach((opcao) => {
      const seed = Math.floor(Math.random() * 1_000_000);
      this.uploadService
        .gerarImagemIa({ tipo, tema: this.iaTema, icones: this.iaIcones, cores: this.iaCores, seed }, this.userId)
        .subscribe({
          next: (res) => { opcao.src = res.imagem; },
          error: () => { opcao.erro = true; },
        });
    });
  }

  /** Só aplica no preview; dá para alternar entre as opções antes de salvar. */
  escolherOpcaoIa(tipo: 'fundo' | 'titulo', src: string) {
    this.iaSelecionada = { ...this.iaSelecionada, [tipo]: src };
    if (tipo === 'fundo') this.previewFundoSecao = src;
    else this.previewFundoTituloSecao = src;
  }

  /** Escolhas da IA ainda não enviadas (ignora as removidas). */
  private iaPendentes(): ['fundo' | 'titulo', string][] {
    return (Object.entries(this.iaSelecionada) as ['fundo' | 'titulo', string | undefined][])
      .filter((e): e is ['fundo' | 'titulo', string] => !!e[1]);
  }

  /** Envia as opções escolhidas pelo upload normal; resolve com os caminhos. */
  private enviarSelecionadasIa() {
    const envios = this.iaPendentes().map(([tipo, src]) => {
      const [meta, base64] = src.split(',');
      const mime = meta.match(/data:(.*?);/)?.[1] || 'image/jpeg';
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
      const arquivo = new File([bytes], `ia-${tipo}.jpg`, { type: mime });
      return this.uploadService.uploadImagem(arquivo, 'secoes', this.userId).pipe(
        map((res) => ({ tipo, caminho: res.caminho }))
      );
    });
    return forkJoin(envios);
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

    const de = this.diaMesParaMesDia(this.secPeriodoDe);
    const ate = this.diaMesParaMesDia(this.secPeriodoAte);
    if (de === undefined || ate === undefined || (!!de !== !!ate)) {
      this.modalService.open({
        type: 'warning',
        title: 'Período inválido',
        message: 'Preencha início e fim no formato DD/MM (ex.: 01/06 a 31/07), ou deixe os dois vazios.',
      });
      return;
    }

    // Opções da IA escolhidas: sobe agora e salva em seguida
    if (this.iaPendentes().length) {
      this.secLoading = true;
      this.enviarSelecionadasIa().subscribe({
        next: (enviados) => {
          for (const { tipo, caminho } of enviados) {
            if (tipo === 'fundo') this.secForm.url_fundo = caminho;
            else this.secForm.fundo_titulo = caminho;
          }
          this.iaSelecionada = {};
          this.secLoading = false;
          this.salvarSecao();
        },
        error: () => {
          this.secLoading = false;
          this.modalService.open({ type: 'error', title: 'Erro no upload', message: 'Não foi possível enviar a imagem gerada.' });
        },
      });
      return;
    }

    const payload: Partial<SecaoAdmin> = {
      ...this.secForm,
      ativo_de: de,
      ativo_ate: ate,
      fixar_ate: this.secForm.fixar_ate || null,
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

  /** "MM-DD" → "DD/MM" */
  mesDiaParaDiaMes(v?: string | null): string {
    if (!v || !/^\d{2}-\d{2}$/.test(v)) return '';
    const [m, d] = v.split('-');
    return `${d}/${m}`;
  }

  /** "DD/MM" → "MM-DD"; '' → null; inválido → undefined */
  diaMesParaMesDia(v: string): string | null | undefined {
    const t = (v ?? '').trim();
    if (!t) return null;
    const m = t.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!m) return undefined;
    const dia = Number(m[1]);
    const mes = Number(m[2]);
    const diasNoMes = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    if (mes < 1 || mes > 12 || dia < 1 || dia > diasNoMes[mes - 1]) return undefined;
    return `${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  }

  /** A seção está no período hoje? (para o badge da tabela) */
  secaoNoPeriodo(s: SecaoAdmin): boolean {
    if (!s.ativo_de || !s.ativo_ate) return true;
    const hoje = this.hojeIso.slice(5);
    return s.ativo_de <= s.ativo_ate
      ? hoje >= s.ativo_de && hoje <= s.ativo_ate
      : hoje >= s.ativo_de || hoje <= s.ativo_ate;
  }

  secaoFixada(s: SecaoAdmin): boolean {
    return !!s.fixar_ate && s.fixar_ate >= this.hojeIso;
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