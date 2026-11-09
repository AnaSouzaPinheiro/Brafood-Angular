import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import {
    AdminCategoriaService,
    CategoriaAdmin,
    SubcategoriaAdmin,
} from '../../../../services/admin/admin-categoria.service';
import {
    AdminSecaoService,
    ReceitaVinculada,
    SecaoAdmin,
} from '../../../../services/admin/admin-secao.service';
import { AdminUploadService } from '../../../../services/admin/admin-upload.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { ModalService } from '../../../../services/modal/modal.service';
import { MediaUrlPipe } from '../../../../shared/pipes/media-url.pipe';

/** Aba "Seções da Home" do painel admin (inclui a geração de imagens com IA). */
@Component({
  selector: 'bra-admin-secoes',
  standalone: true,
  imports: [CommonModule, FormsModule, MediaUrlPipe],
  templateUrl: './admin-secoes.html',
  styleUrls: ['./admin-secoes.scss', './admin-secoes-imagens.scss'],
})
export class AdminSecoes implements OnInit {
  userId!: number;

  categorias: CategoriaAdmin[] = [];
  categoriasComReceitas: CategoriaAdmin[] = [];
  subcategoriasComReceitas: SubcategoriaAdmin[] = [];

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

    this.adminService.listarCategorias().subscribe({
      next: (data) => { this.categorias = data; },
    });
    this.adminService.listarCategoriasComReceitas().subscribe({
      next: (data) => { this.categoriasComReceitas = data; },
    });
    this.carregarSecoes();

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
    const sub = this.subcategoriasComReceitas.find(s => s.id == this.secForm.id_subcategoria)?.nome;
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
      error: (err) => {
        // 409 = nome repetido: mostra o aviso do servidor
        const repetido = err?.status === 409;
        this.modalService.open({
          type: repetido ? 'warning' : 'error',
          title: repetido ? 'Nome repetido' : 'Erro',
          message: err?.error?.mensagem || 'Erro ao salvar seção.',
        });
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

  get subcategoriasDaCategoria(): SubcategoriaAdmin[] {
    if (!this.secForm.id_categoria) return [];
    return this.subcategoriasComReceitas.filter((s) => s.id_categoria === this.secForm.id_categoria);
  }
}
