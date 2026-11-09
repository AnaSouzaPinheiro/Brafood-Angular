import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Recipes } from '../../model/myrecipes';
import { User } from '../../model/user';
import { AuthService } from '../../services/auth/auth.service';
import { AvaliacaoService } from '../../services/avaliacao/avaliacao.service';
import { FavoritoService } from '../../services/favorito/favorito.service';
import { QuadroService } from '../../services/quadro/quadro.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ModalService } from '../../services/modal/modal.service';
import { ToastService } from '../../services/toast/toast.service';
import { Compartilhar } from '../../shared/compartilhar/compartilhar';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { HoverThings } from '../hover-things/hover-things';
import { SalvarEm } from '../salvar-em/salvar-em';

@Component({
  selector: 'bra-info-recipe',
  standalone: true,
  imports: [CommonModule, FormsModule, CustomButton, HoverThings, SalvarEm, Compartilhar],
  templateUrl: './info-recipe.html',
  styleUrl: './info-recipe.scss',
})
export class InfoRecipe implements OnChanges {
  @Input() recipe!: any;

  get mappedInfoRecipe() {
    return {
      titulo: this.recipe?.titulo,
      resumo: this.recipe?.resumo,
      categoria: this.recipe?.categoria
        ? this.recipe.categoria.split(',').map((c: string) => c.trim())
        : [],
      dificuldade: this.recipe?.dificuldade,
      tempo_hora: this.recipe?.tempo_hora,
      tempo_min: this.recipe?.tempo_min,
      tipo_tempo: this.recipe?.tipo_tempo,
      porcoes: this.recipe?.porcoes,
      tipo_porcao: this.recipe?.tipo_porcao,
    };
  }

  getDifficultyImage(level: number): string {
    const paths: Record<number, string> = {
      1: 'assets/imagens/icones/nivel1.png',
      2: 'assets/imagens/icones/nivel2.png',
      3: 'assets/imagens/icones/nivel3.png',
    };
    return paths[level] || paths[1];
  }

  isFavorite = false;
  salvarAberto = false;
  /** Nota pessoal da usuária para esta receita (uma só). */
  nota: string | null = null;
  editandoNota = false;
  notaEdit = '';
  salvandoNota = false;
  mediaAvaliacao: number | null = null;
  totalAvaliacoes: number = 0;
  /** Nota que a própria pessoa deu (estrela cheia na coluna de ações). */
  minhaAvaliacao: number | null = null;
  logado = false;
  userId: number | null = null;
  user!: User;
  Recipes: Recipes[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private modalService: ModalService,
    private toastService: ToastService,
    private quadroService: QuadroService,
    private favoritoService: FavoritoService,
    private avaliacaoService: AvaliacaoService,
    private logger: LoggerService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['recipe'] || !this.recipe?.id) return;

    // garante que só roda no navegador
    if (typeof window === 'undefined') return;

    this.logado = this.auth.isLoggedIn();

    // Usuário antes da avaliação: senão a busca ia sem id e a estrela
    // nunca aparecia preenchida para quem já avaliou
    const usuarioLogado = this.auth.user();
    this.userId = usuarioLogado ? Number(usuarioLogado.id) : null;

    // Carrega média sempre — independente de estar logado
    this.carregarAvaliacao();

    if (!usuarioLogado) return;

    this.quadroService
      .estadoDaReceita(Number(this.recipe.id))
      .subscribe({
        next: (res) => {
          this.isFavorite = res.favorito;
          this.nota = res.nota;
        },
        error: (err) => {
          this.logger.error('Erro ao verificar favorito', err);
        },
      });
  }

  carregarAvaliacao() {
    // Busca só a média pública para exibir no info-recipe (leitura)
    // A avaliação interativa do usuário vive no formulário de comentário
    if (!this.recipe?.id) return;
    this.avaliacaoService
      .buscar(Number(this.userId), Number(this.recipe.id))
      .subscribe({
        next: (res) => {
          this.mediaAvaliacao = res.media;
          this.totalAvaliacoes = res.total;
          this.minhaAvaliacao = res.nota ?? null;
        },
        error: () => {},
      });
  }

  /** Abre o menu "Salvar em…" (Favoritos + quadros). */
  toggleFavorito(ev?: Event) {
    ev?.stopPropagation();
    if (!this.exigirLogin('salvar esta receita')) return;
    this.salvarAberto = !this.salvarAberto;
  }

  private exigirLogin(acao: string): boolean {
    if (this.userId) return true;
    this.modalService.open({
      type: 'confirm',
      title: 'Login necessário',
      message: `Para ${acao}, você precisa estar logado.`,
      confirmText: 'Ir para login',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.router.navigate(['/login'], {
          queryParams: { returnUrl: this.router.url },
        });
      },
    });
    return false;
  }

  // ---- nota pessoal (uma só, editada aqui mesmo) ---------------------------
  abrirNota() {
    if (!this.exigirLogin('adicionar uma nota')) return;
    this.salvarAberto = false;
    this.notaEdit = this.nota ?? '';
    this.editandoNota = true;
    // Foca o campo assim que ele aparecer
    setTimeout(() => {
      const campo = document.getElementById('campo-nota') as HTMLTextAreaElement | null;
      campo?.focus();
      campo?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }

  salvarNota() {
    this.gravarNota(this.notaEdit.trim() || null);
  }

  apagarNota() {
    this.gravarNota(null);
  }

  private gravarNota(nota: string | null) {
    if (this.salvandoNota) return;
    this.salvandoNota = true;

    this.favoritoService.atualizarExtras(Number(this.recipe.id), { nota }).subscribe({
      next: (res) => {
        this.nota = nota;
        this.editandoNota = false;
        this.salvandoNota = false;
        if (res.favoritou) this.isFavorite = true;
        this.toastService.show(
          !nota ? 'Nota apagada' : res.favoritou ? 'Nota salva e receita adicionada aos Favoritos' : 'Nota salva',
          'success',
        );
      },
      error: (err) => {
        this.salvandoNota = false;
        this.toastService.show(err?.error?.error ?? 'Erro ao salvar nota', 'error');
      },
    });
  }

  scrollToComentarios() {
    const element = document.getElementById('comentarios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  // ---- compartilhar (janela padrão do site, igual à dos quadros) ----------
  compartilharAberto = false;

  get linkAtual(): string {
    return typeof window === 'undefined' ? '' : window.location.href;
  }

  shareRecipe() {
    this.salvarAberto = false;
    this.compartilharAberto = true;
  }
}