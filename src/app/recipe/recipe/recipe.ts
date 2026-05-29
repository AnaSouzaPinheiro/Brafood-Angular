import { Component } from '@angular/core';
import { RecipeImages } from '../recipe-images/recipe-images';
import { InfoRecipe } from '../info-recipe/info-recipe';
import { ActivatedRoute, Router } from '@angular/router';
import { Receita } from '../../model/receita';
import { ReceitaService } from '../../services/receita/receita.service';
import { CommonModule } from '@angular/common';
import { Comment } from '../comment/comment';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Comentario } from '../../model/comentario';
import { FormsModule } from '@angular/forms';
import { ComentarioService } from '../../services/comentario/comentario.service';
import { CompartilhamentoService } from '../../services/compartilhamento/compartilhamento.service';
import { AuthService } from '../../services/auth/auth.service';
import { ModalService } from '../../services/modal/modal.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { RecipeSection } from '../../shared/recipe-section/recipe-section';
import { Meta, Title } from '@angular/platform-browser';
import { AvaliacaoService } from '../../services/avaliacao/avaliacao.service';
import { StarRating } from '../../shared/star-rating/star-rating';
import { Section } from '../../model/section-home';
import { toSlug } from '../../utils/slug';
import { ToastService } from '../../services/toast/toast.service';

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
  ],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  recipe?: Receita;
  comentarios: Comentario[] = [];
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

  ngOnInit() {
    this.usuarioId = this.authService.getUserId();
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.ReceitaServices.buscarPorId(id).subscribe((r: any) => {
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
        imagem2: r.imagem2 || '',
        imagem3: r.imagem3 || '',
        qtd_fav: Number(r.qtd_fav),
        data_criacao: r.data_criacao
          ? new Date(r.data_criacao).toLocaleDateString('pt-BR')
          : '',
        autor: r.autor,
        foto_perfil: r.foto_perfil || '',
        bio: r.bio,
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

      this.recarregarComentarios();
      this.getLinkWhatsApp();
      this.carregarRelacionadas();
      this.atualizarOG();
      this.carregarAvaliacao();
    });
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

  get erroComentario(): string {
    const texto = this.novoComentario.trim();
    // Precisa de nota OU texto — não exige os dois
    if (!texto && !this.notaForm)
      return 'Avalie com estrelas ou escreva um comentário.';
    if (texto && texto.length < MIN_COMENTARIO)
      return `Escreva pelo menos ${MIN_COMENTARIO} caracteres.`;
    if (texto.length > MAX_COMENTARIO)
      return `O comentário não pode ultrapassar ${MAX_COMENTARIO} caracteres.`;
    return '';
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

  comentar() {
    this.tentouComentar = true;
    this.comentarioTocado = true;

    if (!this.usuarioId) {
      this.modalService.open({
        type: 'confirm',
        title: 'Login necessário',
        message: 'Para avaliar ou comentar, você precisa estar logado.',
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

    const texto = this.novoComentario.trim();
    const idReceita = this.recipe!.id;

    // Guard: avaliação já enviada e nada mudou (mesma nota, sem texto novo)
    const notaIgual =
      this.notaForm !== null && this.notaForm === this.notaUsuario;
    if (notaIgual && !texto) {
      this.toastService.show('Você já enviou esta avaliação.', 'info');
      return;
    }

    // Comentário com nota embutida (nota é opcional)
    if (texto) {
      this.comentarioService
        .criar({
          id_usuario: this.usuarioId,
          id_receita: idReceita,
          texto,
          nota: this.notaForm ?? undefined,
        })
        .subscribe(() => {
          this.novoComentario = '';
          this.tentouComentar = false;
          this.comentarioTocado = false;
          if (this.notaForm) {
            this.notaUsuario = this.notaForm;
          }
          this.carregarAvaliacao();
          this.recarregarComentarios();
          this.toastService.show('Comentário enviado com sucesso!', 'success');
        });
    } else if (this.notaForm) {
      // Só nota sem texto — salva via avaliacaoService diretamente
      this.avaliacaoService
        .avaliar(this.usuarioId, idReceita, this.notaForm)
        .subscribe({
          next: (res) => {
            this.notaUsuario = this.notaForm;
            this.mediaAvaliacao = res.media;
            this.totalAvaliacoes = res.total;
            this.tentouComentar = false;
            this.comentarioTocado = false;
            this.toastService.show('Avaliação enviada com sucesso!', 'success');
          },
          error: () => {},
        });
    }
  }

  recarregarComentarios() {
    if (!this.recipe) return;

    this.comentarioService
      .listarcommentsPorReceita(this.recipe.id)
      .subscribe((cs) => {
        this.comentarios = this.buildTree(cs);
      });
  }

  enviarComentario(payload: { texto: string; id_comentario_pai: number }) {
    if (!this.recipe || this.usuarioId === null) {
      return;
    }

    this.comentarioService
      .criar({
        id_usuario: this.usuarioId,
        id_receita: this.recipe.id,
        texto: payload.texto,
        id_comentario_pai: payload.id_comentario_pai,
      })
      .subscribe(() => this.recarregarComentarios());
  }

  verMaisComentarios() {
    this.visibleCommentsCount += 3;
  }
}
