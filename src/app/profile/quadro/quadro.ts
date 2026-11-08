import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { FavoritoService } from '../../services/favorito/favorito.service';
import { ModalService } from '../../services/modal/modal.service';
import {
  QuadroResumo,
  QuadroService,
  StatusReceita,
} from '../../services/quadro/quadro.service';
import { ToastService } from '../../services/toast/toast.service';
import { RecipeCardSkeleton } from '../../shared/recipe-card-skeleton/recipe-card-skeleton';
import { EscolherQuadro } from '../escolher-quadro/escolher-quadro';
import { Perfil } from '../perfil/perfil';
import { SeletorReceitas } from '../seletor-receitas/seletor-receitas';

const POR_PAGINA = 6;

type FiltroStatus = 'todas' | 'quero_fazer' | 'ja_fiz' | 'sem';
type AcaoDestino = { tipo: 'adicionar' | 'mover'; ids: number[] };

/**
 * Receitas de um quadro. `/perfil/favoritas/todas` é o quadro fixo
 * "Favoritos" (todas as salvas); os demais vêm de `quadros`.
 * Cada card tem um menu ⋯ (adicionar/mover/status/remover) e o topo
 * tem "Selecionar" para fazer o mesmo em massa.
 */
@Component({
  selector: 'bra-quadro',
  standalone: true,
  imports: [
    Perfil,
    RecipeCard,
    RecipeCardSkeleton,
    RouterModule,
    CommonModule,
    FormsModule,
    SeletorReceitas,
    EscolherQuadro,
  ],
  templateUrl: './quadro.html',
  styleUrls: ['./quadro.scss', './barra-selecao.scss'],
})
export class Quadro implements OnInit {
  idQuadro: number | null = null; // null = Favoritos
  nome = 'Favoritos';
  descricao: string | null = null;
  receitas: any[] = [];
  carregando = true;

  /** Os demais quadros do usuário (destinos de adicionar/mover). */
  outrosQuadros: QuadroResumo[] = [];

  editando = false;
  nomeEdit = '';
  descricaoEdit = '';

  pagina = 1;
  filtroStatus: FiltroStatus = 'todas';
  seletorAberto = false;

  /** Id da receita com o menu ⋯ aberto. */
  menuAberto: number | null = null;
  /** Janelinha "Escolher quadro" aberta para esta ação. */
  acaoDestino: AcaoDestino | null = null;

  selecionando = false;
  selecionadas = new Set<number>();
  ocupado = false;

  readonly filtrosStatus: { valor: FiltroStatus; rotulo: string }[] = [
    { valor: 'todas', rotulo: 'Todas' },
    { valor: 'quero_fazer', rotulo: 'Quero fazer' },
    { valor: 'ja_fiz', rotulo: 'Já fiz' },
    { valor: 'sem', rotulo: 'Sem status' },
  ];

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
    this.carregarQuadros();
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

  private carregarQuadros() {
    this.quadroService.listar().subscribe({
      next: (res) => (this.outrosQuadros = res.quadros.filter((q) => q.id !== this.idQuadro)),
      error: () => {},
    });
  }

  private setReceitas(data: any) {
    this.receitas = Array.isArray(data) ? data : [];
    this.carregando = false;
    if (this.pagina > this.paginas) this.pagina = Math.max(1, this.paginas);
  }

  // ---- filtro por status ------------------------------------------------
  get filtradas() {
    return this.receitas.filter((r) => this.passa(r, this.filtroStatus));
  }

  private passa(r: any, f: FiltroStatus) {
    if (f === 'todas') return true;
    if (f === 'sem') return !r.status;
    return r.status === f;
  }

  contar(f: FiltroStatus) {
    return this.receitas.filter((r) => this.passa(r, f)).length;
  }

  filtrar(f: FiltroStatus) {
    this.filtroStatus = f;
    this.pagina = 1;
  }

  // ---- paginação ---------------------------------------------------------
  get receitasPagina() {
    const ini = (this.pagina - 1) * POR_PAGINA;
    return this.filtradas.slice(ini, ini + POR_PAGINA);
  }
  get paginas() {
    return Math.ceil(this.filtradas.length / POR_PAGINA);
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

  // ---- adicionar receitas salvas (seletor) ------------------------------
  get idsNoQuadro(): number[] {
    return this.receitas.map((r) => Number(r.id));
  }

  adicionarEscolhidas(ids: number[]) {
    this.seletorAberto = false;
    if (!ids.length || this.idQuadro === null) return;

    this.quadroService.adicionarVarias(this.idQuadro, ids).subscribe({
      next: () => {
        this.toast.show(
          ids.length === 1 ? 'Receita adicionada' : ids.length + ' receitas adicionadas',
          'success',
        );
        this.carregar();
      },
      error: (err) => this.toast.show(err?.error?.error ?? 'Erro ao adicionar receitas', 'error'),
    });
  }

  // ---- menu ⋯ do card -----------------------------------------------------
  toggleMenu(ev: Event, id: number) {
    ev.stopPropagation();
    ev.preventDefault();
    this.menuAberto = this.menuAberto === id ? null : id;
  }

  @HostListener('document:click')
  fecharMenu() {
    this.menuAberto = null;
  }

  @HostListener('document:keydown.escape')
  onEsc() {
    if (this.menuAberto !== null) this.menuAberto = null;
    else if (this.selecionando && !this.acaoDestino) this.sairSelecao();
  }

  marcarStatus(r: any, status: Exclude<StatusReceita, null>) {
    this.menuAberto = null;
    const novo = r.status === status ? null : status;
    this.favoritoService.atualizarExtras(Number(r.id), { status: novo }).subscribe({
      next: () => (r.status = novo),
      error: () => this.toast.show('Erro ao salvar status', 'error'),
    });
  }

  // ---- seleção em massa ---------------------------------------------------
  entrarSelecao() {
    this.selecionando = true;
    this.selecionadas.clear();
    this.menuAberto = null;
  }

  sairSelecao() {
    this.selecionando = false;
    this.selecionadas.clear();
  }

  toggleSelecao(id: number) {
    this.selecionadas.has(id) ? this.selecionadas.delete(id) : this.selecionadas.add(id);
  }

  get todasSelecionadas() {
    const f = this.filtradas;
    return f.length > 0 && f.every((r) => this.selecionadas.has(Number(r.id)));
  }

  toggleTodas() {
    const marcar = !this.todasSelecionadas;
    this.filtradas.forEach((r) =>
      marcar ? this.selecionadas.add(Number(r.id)) : this.selecionadas.delete(Number(r.id)),
    );
  }

  // ---- ações (uma receita pelo ⋯, ou várias pela seleção) --------------------
  abrirDestino(tipo: AcaoDestino['tipo'], ids: number[]) {
    this.menuAberto = null;
    if (!ids.length) return;
    this.acaoDestino = { tipo, ids };
  }

  /** Adiciona (ou move) as receitas para um quadro existente. */
  enviarPara(idDestino: number) {
    const acao = this.acaoDestino;
    if (!acao) return;
    const nomeDestino = this.outrosQuadros.find((q) => q.id === idDestino)?.nome ?? 'quadro';
    this.executar(acao, this.quadroService.adicionarVarias(idDestino, acao.ids), nomeDestino);
  }

  /** Cria um quadro novo já com as receitas (e tira daqui, se for mover). */
  enviarParaNovo(nome: string) {
    const acao = this.acaoDestino;
    if (!acao) return;
    this.executar(acao, this.quadroService.criar(nome, null, acao.ids), nome);
  }

  private executar(acao: AcaoDestino, adicionar$: Observable<unknown>, nomeDestino: string) {
    if (this.ocupado) return;
    this.ocupado = true;

    const mover = acao.tipo === 'mover' && this.idQuadro !== null;
    adicionar$
      .pipe(
        switchMap(() =>
          mover ? this.quadroService.removerVarias(this.idQuadro!, acao.ids) : of(null),
        ),
      )
      .subscribe({
        next: () => {
          const qtd = acao.ids.length === 1 ? 'Receita' : acao.ids.length + ' receitas';
          this.toast.show(
            `${qtd} ${mover ? 'movida' : 'adicionada'}${acao.ids.length === 1 ? '' : 's'} para "${nomeDestino}"`,
            'success',
          );
          this.ocupado = false;
          this.acaoDestino = null;
          this.sairSelecao();
          this.carregarQuadros();
          if (mover) this.carregar();
        },
        error: (err) => {
          this.ocupado = false;
          this.toast.show(err?.error?.error ?? 'Não foi possível concluir', 'error');
        },
      });
  }

  remover(ids: number[]) {
    this.menuAberto = null;
    if (!ids.length) return;
    const varias = ids.length > 1;

    if (this.ehFavoritos) {
      this.modal.open({
        type: 'confirm',
        title: 'Remover dos favoritos',
        message: varias
          ? `Remover ${ids.length} receitas dos favoritos? Elas também sairão de todos os seus quadros.`
          : 'A receita também sairá de todos os seus quadros. Continuar?',
        confirmText: 'Remover',
        cancelText: 'Cancelar',
        onConfirm: () =>
          this.favoritoService.desfavoritarVarias(ids).subscribe({
            next: () => this.aposRemover(ids),
            error: () => this.toast.show('Erro ao remover', 'error'),
          }),
      });
      return;
    }

    const executar = () =>
      this.quadroService.removerVarias(this.idQuadro!, ids).subscribe({
        next: () => this.aposRemover(ids),
        error: () => this.toast.show('Erro ao remover', 'error'),
      });

    if (!varias) {
      executar();
      return;
    }
    this.modal.open({
      type: 'confirm',
      title: 'Remover do quadro',
      message: `Remover ${ids.length} receitas de "${this.nome}"? Elas continuam nos seus Favoritos.`,
      confirmText: 'Remover',
      cancelText: 'Cancelar',
      onConfirm: executar,
    });
  }

  private aposRemover(ids: number[]) {
    const fora = new Set(ids);
    this.setReceitas(this.receitas.filter((r) => !fora.has(Number(r.id))));
    this.sairSelecao();
    this.carregarQuadros();
  }

  get idsSelecionados(): number[] {
    return [...this.selecionadas];
  }
}
