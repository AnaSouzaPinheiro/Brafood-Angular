import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, catchError, map, of, switchMap, tap } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Meta, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Comentario } from '../../model/comentario';
import { Receita } from '../../model/receita';
import { Section } from '../../model/section-home';
import { AuthService } from '../../services/auth/auth.service';
import { AvaliacaoService } from '../../services/avaliacao/avaliacao.service';
import { ComentarioService } from '../../services/comentario/comentario.service';
import { CompartilhamentoService } from '../../services/compartilhamento/compartilhamento.service';
import { ModalService } from '../../services/modal/modal.service';
import { ReceitaService } from '../../services/receita/receita.service';
import { ToastService } from '../../services/toast/toast.service';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { RecipeDetailSkeleton } from '../../shared/recipe-detail-skeleton/recipe-detail-skeleton';
import { RecipeSection } from '../../shared/recipe-section/recipe-section';
import { StarRating } from '../../shared/star-rating/star-rating';
import { toSlug } from '../../utils/slug';
import { Comment } from '../comment/comment';
import { InfoRecipe } from '../info-recipe/info-recipe';
import { RecipeCredit } from '../recipe-credit/recipe-credit';
import { RecipeImages } from '../recipe-images/recipe-images';

const MIN_COMENTARIO = 3;
const MAX_COMENTARIO = 1000;

@Component({
  selector: 'bra-recipe',
  imports: [
    RecipeImages,
    InfoRecipe,
    CommonModule,
    Comment,
    CustomButton,
    FormsModule,
    MediaUrlPipe,
    RecipeSection,
    StarRating,
    RecipeCredit,
    RouterModule,
    RecipeDetailSkeleton,
  ],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  recipe?: Receita;
  comentarios: Comentario[] = [];
  /** Comentário raiz já existente do usuário logado nesta receita (regra: só 1 por receita) */
  meuComentario: Comentario | null = null;
  secaoRelacionadas: Section | null = null;

  // Avaliação integrada ao formulário de comentário
  notaForm: number | null = null; // estrela selecionada antes de enviar
  notaUsuario: number | null = null; // nota já salva do usuário
  mediaAvaliacao: number | null = null;
  totalAvaliacoes: number = 0;

  novoComentario = '';
  urlWhatsApp = '';
  visibleCommentsCount = 3;

  usuarioId: number | null = null;
  tentouComentar = false;
  comentarioTocado = false;
  loadingRecipe = true;
  enviandoComentario = false;

  constructor(
    private meta: Meta,
    private router: Router,
    private titleService: Title,
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: ModalService,
    private ReceitaServices: ReceitaService,
    private avaliacaoService: AvaliacaoService,
    private comentarioService: ComentarioService,
    private compartilhamentoService: CompartilhamentoService,
    private toastService: ToastService,
  ) {}

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.usuarioId = this.authService.getUserId();

    // O Angular reaproveita este componente ao navegar de uma receita para
    // outra (ex.: "receitas relacionadas"), então é preciso reagir à troca
    // do :id na URL em vez de ler o snapshot só uma vez.
    this.route.paramMap
      .pipe(
        map((params) => Number(params.get('id'))),
        tap(() => this.resetarEstado()),
        switchMap((id) => this.ReceitaServices.buscarPorId(id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
      next: (r: any) => {
        this.recipe = {
          id: Number(r.id),
          titulo: r.titulo,
          resumo: r.resumo,
          categoria: r.categoria ?? '',
          idCategoria: r.idCategoria ?? null,
          subcategoria: r.subcategoria ?? '',
          dificuldade: Number(r.dificuldade),
          tempo_hora: Number(r.tempo_hora),
          tempo_min: Number(r.tempo_min),
          porcoes: r.porcoes,
          tipo_porcao: r.tipo_porcao,
          imagem1: r.imagem1 || '',
          imagens: r.imagens || [],
          qtd_fav: Number(r.qtd_fav),
          data_criacao: r.data_criacao
            ? new Date(r.data_criacao).toLocaleDateString('pt-BR')
            : '',
          usuarioId: r.id_usuario != null ? Number(r.id_usuario) : null,
          usuarioApelido: r.autor_apelido || null,
          autor: r.autor,
          foto_perfil: r.foto_perfil || '',
          bio: r.bio,
          eh_propria:
            r.eh_propria === undefined ? true : Number(r.eh_propria) === 1,
          fonte_autor: r.fonte_autor || '',
          fonte_url: r.fonte_url || '',
          video_url: r.video_url || '',
          ingredientes: (r.ingredientes || []).map((i: any) => ({
            titulo: i.titulo,
            itens: i.itens || [],
          })),
          etapas: (r.etapas || []).map((e: any) => ({
            titulo: e.titulo,
            ordem: Number(e.ordem),
            descricoes: (e.descricoes || []).map((d: any) => ({
              descricao: d.descricao,
              ordem: Number(d.ordem),
            })),
          })),
        };

        this.loadingRecipe = false;

        this.recarregarComentarios();
        this.getLinkWhatsApp();
        this.carregarRelacionadas();
        this.atualizarOG();
        this.carregarAvaliacao();
      },
      error: () => {
        this.loadingRecipe = false;
      },
    });
  }

  /** Limpa os dados da receita anterior antes de carregar a próxima */
  private resetarEstado() {
    this.recipe = undefined;
    this.comentarios = [];
    this.meuComentario = null;
    this.secaoRelacionadas = null;
    this.notaForm = null;
    this.notaUsuario = null;
    this.mediaAvaliacao = null;
    this.totalAvaliacoes = 0;
    this.novoComentario = '';
    this.visibleCommentsCount = 3;
    this.editandoAvaliacao = false;
    this.tentouComentar = false;
    this.comentarioTocado = false;
    this.loadingRecipe = true;
  }

  carregarAvaliacao() {
    if (!this.recipe?.id) return;
    const idReceita = Number(this.recipe.id);
    const userId = this.usuarioId;
    if (userId) {
      this.avaliacaoService.buscar(userId, idReceita).subscribe({
        next: (res) => {
          this.notaUsuario = res.nota;
          this.notaForm = res.nota; // pré-preenche as estrelas no form
          this.mediaAvaliacao = res.media;
          this.totalAvaliacoes = res.total;
        },
        error: () => {},
      });
    } else {
      this.avaliacaoService.buscar(0, idReceita).subscribe({
        next: (res) => {
          this.mediaAvaliacao = res.media;
          this.totalAvaliacoes = res.total;
        },
        error: () => {},
      });
    }
  }

  onNotaFormChange(nota: number | null) {
    this.notaForm = nota;
  }

  atualizarOG() {
    if (!this.recipe) return;

    const titulo = this.recipe.titulo;
    const resumo = this.recipe.resumo ?? '';
    const imagem = this.recipe.imagem1 ?? '';
    const url = typeof window !== 'undefined' ? window.location.href : '';

    // Título da aba
    this.titleService.setTitle(`${titulo} | BraFood`);

    // Open Graph
    this.meta.updateTag({ property: 'og:title', content: titulo });
    this.meta.updateTag({ property: 'og:description', content: resumo });
    this.meta.updateTag({ property: 'og:image', content: imagem });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'article' });

    // Twitter Card
    this.meta.updateTag({
      name: 'twitter:card',
      content: 'summary_large_image',
    });
    this.meta.updateTag({ name: 'twitter:title', content: titulo });
    this.meta.updateTag({ name: 'twitter:description', content: resumo });
    this.meta.updateTag({ name: 'twitter:image', content: imagem });

    // Meta description padrão
    this.meta.updateTag({ name: 'description', content: resumo });
  }

  carregarRelacionadas() {
    if (!this.recipe) return;

    // Pega a categoria da receita atual pelo nome (campo categoria)
    // e busca até 6 receitas da mesma categoria, excluindo a atual
    this.ReceitaServices.listCat(
      {
        // idCategoria vem como string do GROUP_CONCAT (ex: "3" ou "3, 5") — pega o primeiro
        id: Number(
          String(this.recipe.idCategoria ?? '0')
            .split(',')[0]
            .trim(),
        ),
        nome: String(this.recipe.categoria ?? '')
          .split(',')[0]
          .trim(),
      },
      { ordenar: 'aleatorio' },
    ).subscribe((receitas) => {
      const relacionadas = receitas
        .filter((r: any) => r.id !== this.recipe!.id)
        .slice(0, 6);

      if (relacionadas.length === 0) {
        this.secaoRelacionadas = null;
        return;
      }

      this.secaoRelacionadas = {
        id: 0,
        title: `Mais receitas de ${this.recipe!.categoria ?? 'culinária'}`,
        urlSection: null,
        corFundo: null,
        fundoTitle: null,
        ordem: 0,
        tituloCorTipo: 'gradiente',
        tituloCorSolid: null,
        tituloGradiente1: '#8aabff',
        tituloGradiente2: '#0049ff',
        cardExibir: 'subcategoria',
        recipes: relacionadas.map((r: any) => ({
          id: r.id,
          category: r.categoria ?? '',
          img: r.imagem1 ?? '',
          url: `/receita/${toSlug(r.titulo)}/${r.id}`,
          subcategorias: r.subcategorias ?? [],
          // campos extras que o recipe-card lê diretamente de 'recipe'
          categoria: r.categoria,
          subcategoria: r.subcategoria ?? null,
          imagem1: r.imagem1,
          titulo: r.titulo,
          qtd_fav: r.qtd_fav,
          resumo: r.resumo,
          resume: {
            title: r.titulo,
            qtdFav: Number(r.qtd_fav ?? 0),
            text: r.resumo ?? '',
          },
        })),
      };
    });
  }

  onComentarioChange() {
    if (this.tentouComentar) {
      this.comentarioTocado = true;
    }
  }

  onComentarioBlur() {
    this.comentarioTocado = true;
  }

  get comentarioInvalido(): boolean {
    if (!this.comentarioTocado && !this.tentouComentar) return false;
    return this.erroComentario.length > 0;
  }

  /** Estrelas obrigatórias; texto opcional (mas, se tiver, com 3+ caracteres). */
  get erroComentario(): string {
    const texto = this.novoComentario.trim();
    if (!this.notaForm) return 'Escolha de 1 a 5 estrelas para avaliar.';
    if (texto && texto.length < MIN_COMENTARIO)
      return `Escreva pelo menos ${MIN_COMENTARIO} caracteres (ou deixe o texto em branco).`;
    if (texto.length > MAX_COMENTARIO)
      return `O texto não pode ultrapassar ${MAX_COMENTARIO} caracteres.`;
    if (!texto && this.minhaAvaliacao && !this.minhaAvaliacao.so_nota && (this.minhaAvaliacao.replies?.length || 0) > 0)
      return 'Sua avaliação tem respostas, então o texto não pode ficar vazio.';
    return '';
  }

  // ── Minha avaliação ──────────────────────────────────────────────────────
  editandoAvaliacao = false;

  /** A avaliação da própria pessoa (com ou sem texto), se existir. */
  get minhaAvaliacao(): Comentario | null {
    return this.meuComentario;
  }

  /** O formulário aparece para quem ainda não avaliou, ou ao editar. */
  get mostrarFormulario(): boolean {
    return !this.minhaAvaliacao || this.editandoAvaliacao;
  }

  editarMinhaAvaliacao() {
    const minha = this.minhaAvaliacao;
    if (!minha) return;
    this.editandoAvaliacao = true;
    this.notaForm = this.notaUsuario ?? minha.nota ?? null;
    this.novoComentario = minha.so_nota ? '' : minha.texto;
    this.tentouComentar = false;
    this.comentarioTocado = false;
    setTimeout(() =>
      document.querySelector('.avaliacao-comment-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' }),
    );
  }

  cancelarEdicao() {
    this.editandoAvaliacao = false;
    this.notaForm = this.notaUsuario;
    this.novoComentario = '';
    this.tentouComentar = false;
    this.comentarioTocado = false;
  }

  /** Apaga a avaliação inteira: estrelas + texto (e as respostas do texto). */
  excluirMinhaAvaliacao() {
    const minha = this.minhaAvaliacao;
    if (!minha || !this.usuarioId || !this.recipe) return;
    const temRespostas = (minha.replies?.length || 0) > 0;

    this.modalService.open({
      type: 'confirm',
      title: 'Excluir avaliação',
      message: temRespostas
        ? 'Sua avaliação e as respostas dela serão apagadas. Continuar?'
        : 'Tem certeza que quer excluir sua avaliação?',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        const idReceita = Number(this.recipe!.id);
        const apagarTexto$ = minha.so_nota
          ? of(null)
          : this.comentarioService.deletar(minha.id).pipe(catchError(() => of(null)));

        apagarTexto$
          .pipe(switchMap(() => this.avaliacaoService.remover(this.usuarioId!, idReceita)))
          .subscribe({
            next: (res) => {
              this.notaUsuario = null;
              this.notaForm = null;
              this.mediaAvaliacao = res.media;
              this.totalAvaliacoes = res.total;
              this.editandoAvaliacao = false;
              this.recarregarComentarios();
              this.toastService.show('Avaliação excluída.', 'success');
            },
            error: () => this.toastService.show('Não foi possível excluir sua avaliação. Tente de novo.', 'error'),
          });
      },
    });
  }

  buildTree(comments: Comentario[]) {
    const map = new Map<number, Comentario>();

    comments.forEach((c) => {
      c.replies = [];
      map.set(c.id, c);
    });

    return comments.filter((c) => {
      if (c.id_comentario_pai) {
        const pai = map.get(c.id_comentario_pai);
        if (pai) {
          c.nome_pai = pai.nome_usuario;
          c.apelido_pai = pai.apelido_usuario;
          c.id_usuario_pai = pai.id_usuario;
          pai.replies?.push(c);
        }
        return false;
      }
      return true;
    });
  }

  getLinkWhatsApp() {
    if (!this.recipe?.ingredientes) {
      return;
    }

    this.compartilhamentoService
      .getLinkWhatsApp(this.recipe.ingredientes)
      .subscribe((url) => {
        this.urlWhatsApp = url;
      });
  }

  /** Publica (ou salva a edição de) uma avaliação: estrelas + texto opcional. */
  comentar() {
    if (this.enviandoComentario) return;

    this.tentouComentar = true;
    this.comentarioTocado = true;

    if (!this.usuarioId) {
      this.modalService.open({
        type: 'confirm',
        title: 'Login necessário',
        message: 'Para avaliar, você precisa estar logado.',
        confirmText: 'Ir para login',
        cancelText: 'Cancelar',
        onConfirm: () => {
          this.router.navigate(['/login'], {
            queryParams: { returnUrl: this.router.url },
          });
        },
      });
      return;
    }

    if (this.erroComentario) return;

    const nota = this.notaForm!;
    const texto = this.novoComentario.trim();
    const idReceita = Number(this.recipe!.id);
    const minha = this.minhaAvaliacao;
    const temTexto = !!minha && !minha.so_nota;

    // 1) estrelas (cria ou atualiza)  2) texto: cria, edita, apaga ou nada
    let texto$: Observable<unknown> = of(null);
    if (temTexto && texto && texto !== minha!.texto) {
      texto$ = this.comentarioService.atualizar(minha!.id, texto);
    } else if (temTexto && !texto) {
      texto$ = this.comentarioService.deletar(minha!.id);
    } else if (!temTexto && texto) {
      texto$ = this.comentarioService.criar({ id_usuario: this.usuarioId, id_receita: idReceita, texto, nota });
    }

    this.enviandoComentario = true;
    const editando = this.editandoAvaliacao;

    this.avaliacaoService
      .avaliar(this.usuarioId, idReceita, nota)
      .pipe(switchMap((res) => texto$.pipe(map(() => res))))
      .subscribe({
        next: (res) => {
          this.notaUsuario = nota;
          this.mediaAvaliacao = res.media;
          this.totalAvaliacoes = res.total;
          this.novoComentario = '';
          this.tentouComentar = false;
          this.comentarioTocado = false;
          this.editandoAvaliacao = false;
          this.enviandoComentario = false;
          this.recarregarComentarios();
          this.toastService.show(editando ? 'Avaliação atualizada!' : 'Avaliação publicada!', 'success');
        },
        error: () => {
          this.enviandoComentario = false;
          this.recarregarComentarios();
          this.toastService.show('Não foi possível salvar sua avaliação. Tente de novo.', 'error');
        },
      });
  }

  recarregarComentarios() {
    if (!this.recipe) return;

    this.comentarioService
      .listarcommentsPorReceita(this.recipe.id)
      .subscribe((cs) => {
        // Mais recentes primeiro; a avaliação da própria pessoa fica no topo
        const raizes = this.buildTree(cs).reverse();
        const ehMinha = (c: Comentario) =>
          this.usuarioId !== null && Number(c.id_usuario) === Number(this.usuarioId);
        this.meuComentario = raizes.find(ehMinha) ?? null;
        this.comentarios = this.meuComentario
          ? [this.meuComentario, ...raizes.filter((c) => c !== this.meuComentario)]
          : raizes;
      });
  }

  enviarComentario(payload: {
    texto: string;
    id_comentario_pai: number;
    onDone: (success: boolean) => void;
  }) {
    if (!this.recipe || this.usuarioId === null) {
      payload.onDone(false);
      return;
    }

    this.comentarioService
      .criar({
        id_usuario: this.usuarioId,
        id_receita: this.recipe.id,
        texto: payload.texto,
        id_comentario_pai: payload.id_comentario_pai,
      })
      .subscribe({
        next: () => {
          this.recarregarComentarios();
          this.toastService.show('Resposta enviada com sucesso!', 'success');
          payload.onDone(true);
        },
        error: () => {
          this.toastService.show(
            'Não foi possível enviar sua resposta. Tente de novo.',
            'error',
          );
          payload.onDone(false);
        },
      });
  }

  excluirComentario(payload: { id: number; onDone: (success: boolean) => void }) {
    if (this.usuarioId === null) {
      payload.onDone(false);
      return;
    }

    // Exclui uma resposta (ou, se admin, o texto de outra pessoa)
    this.comentarioService.deletar(payload.id).subscribe({
      next: () => {
        this.recarregarComentarios();
        this.toastService.show('Comentário excluído.', 'success');
        payload.onDone(true);
      },
      error: () => {
        this.toastService.show(
          'Não foi possível excluir o comentário. Tente de novo.',
          'error',
        );
        payload.onDone(false);
      },
    });
  }

  verMaisComentarios() {
    this.visibleCommentsCount += 3;
  }
}