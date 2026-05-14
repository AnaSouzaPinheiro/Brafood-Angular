import { Component } from '@angular/core';
import { RecipeImages } from '../recipe-images/recipe-images';
import { InfoRecipe } from '../info-recipe/info-recipe';
import { ActivatedRoute } from '@angular/router';
import { Receita } from '../../model/receita';
import { ReceitaService } from '../../services/receita/receita.service';
import { CommonModule } from '@angular/common';
import { Comment } from '../comment/comment';
import { BraInput } from '../../shared/input/input';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Comentario } from '../../model/comentario';
import { FormsModule } from '@angular/forms';
import { ComentarioService } from '../../services/comentario/comentario.service';
import { CompartilhamentoService } from '../../services/compartilhamento/compartilhamento.service';
import { AuthService } from '../../services/auth/auth.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';

@Component({
  selector: 'bra-recipe',
  imports: [
    RecipeImages,
    InfoRecipe,
    CommonModule,
    Comment,
    BraInput,
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

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
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
    if (
      !this.recipe ||
      !this.novoComentario.trim() ||
      this.usuarioId === null
    ) {
      return;
    }

    this.comentarioService
      .criar({
        id_usuario: this.usuarioId,
        id_receita: this.recipe.id,
        texto: this.novoComentario,
      })
      .subscribe(() => {
        this.novoComentario = '';
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
