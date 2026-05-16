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
  ],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  recipe?: Receita;
  comentarios: Comentario[] = [];

  novoComentario = '';
  urlWhatsApp = '';
  visibleCommentsCount = 3;

  usuarioId: number | null = null;

  tentouComentar = false;
  comentarioTocado = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private modalService: ModalService,
    private ReceitaServices: ReceitaService,
    private comentarioService: ComentarioService,
    private compartilhamentoService: CompartilhamentoService,
  ) {}

  ngOnInit() {
    this.usuarioId = this.authService.getUserId();
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.ReceitaServices.buscarPorId(id).subscribe((r: any) => {
      this.recipe = {
        id: Number(r.id),
        titulo: r.titulo,
        resumo: '',
        categoria: r.categoria ?? '',
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
    if (!texto) return 'Escreva algo antes de comentar.';
    if (texto.length < MIN_COMENTARIO)
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
        map.get(c.id_comentario_pai)?.replies?.push(c);
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
        message: 'Para comentar nesta receita, você precisa estar logado.',
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

    this.comentarioService
      .criar({
        id_usuario: this.usuarioId,
        id_receita: this.recipe!.id,
        texto: this.novoComentario.trim(),
      })
      .subscribe(() => {
        this.novoComentario = '';
        this.tentouComentar = false;
        this.comentarioTocado = false;
        this.recarregarComentarios();
      });
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
