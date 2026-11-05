import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { Recipes } from '../../model/myrecipes';
import { User } from '../../model/user';
import { AuthService } from '../../services/auth/auth.service';
import { AvaliacaoService } from '../../services/avaliacao/avaliacao.service';
import { FavoritoService } from '../../services/favorito/favorito.service';
import { LoggerService } from '../../services/logger/logger.service';
import { ModalService } from '../../services/modal/modal.service';
import { ToastService } from '../../services/toast/toast.service';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { HoverThings } from '../hover-things/hover-things';

@Component({
  selector: 'bra-info-recipe',
  standalone: true,
  imports: [CommonModule, CustomButton, HoverThings],
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
  mediaAvaliacao: number | null = null;
  totalAvaliacoes: number = 0;
  logado = false;
  userId: number | null = null;
  user!: User;
  Recipes: Recipes[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private modalService: ModalService,
    private toastService: ToastService,
    private favoritoService: FavoritoService,
    private avaliacaoService: AvaliacaoService,
    private logger: LoggerService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['recipe'] || !this.recipe?.id) return;

    // garante que só roda no navegador
    if (typeof window === 'undefined') return;

    this.logado = this.auth.isLoggedIn();

    // Carrega média sempre — independente de estar logado
    this.carregarAvaliacao();

    const usuarioLogado = this.auth.user();
    if (!usuarioLogado) return;

    this.userId = Number(usuarioLogado.id);

    this.favoritoService
      .isFavorita(this.userId, Number(this.recipe.id))
      .subscribe({
        next: (res) => {
          this.isFavorite = res.favorite;
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
        },
        error: () => {},
      });
  }

  toggleFavorito() {
    if (!this.userId) {
      this.modalService.open({
        type: 'confirm',
        title: 'Login necessário',
        message: 'Para avaliar esta receita, você precisa estar logado.',
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

    const receitaIdNum = Number(this.recipe.id);
    const userIdNum = this.userId;

    if (this.isFavorite) {
      this.favoritoService
        .desfavoritar(userIdNum, receitaIdNum)
        .subscribe(() => {
          this.isFavorite = false;
        });
    } else {
      this.favoritoService.favoritar(userIdNum, receitaIdNum).subscribe(() => {
        this.isFavorite = true;
        this.toastService.show(
          `Receita favoritada! ${'<i class="fa-solid fa-heart"></i>'}`,
          'success',
        );
      });
    }
  }

  scrollToComentarios() {
    const element = document.getElementById('comentarios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  shareRecipe() {
    const url = window.location.href;

    if (navigator.share) {
      navigator
        .share({
          title: this.recipe?.titulo,
          text: `${this.recipe?.titulo} - Confira essa receita!`,
          url,
        })
        .catch(() => this.fallbackShare(url));

      return;
    }

    this.fallbackShare(url);
  }

  fallbackShare(url: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(url);
      this.toastService.show('Link copiado!', 'success');
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    this.toastService.show('Link copiado!', 'success');
  }
}