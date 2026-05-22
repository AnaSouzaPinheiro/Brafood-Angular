import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor } from '@angular/common';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { HoverThings } from '../hover-things/hover-things';
import { User } from '../../model/user';
import { AuthService } from '../../services/auth/auth.service';
import { Router, RouterModule } from '@angular/router';
import { Recipes } from '../../model/myrecipes';
import { FavoritoService } from '../../services/favorito/favorito.service';
import { AvaliacaoService } from '../../services/avaliacao/avaliacao.service';
import { StarRating } from '../../shared/star-rating/star-rating';
import { ModalService } from '../../services/modal/modal.service';
import { ToastService } from '../../services/toast/toast.service';

@Component({
  selector: 'bra-info-recipe',
  standalone: true,
  imports: [NgFor, CustomButton, HoverThings, StarRating, RouterModule],
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
  notaUsuario: number | null = null;
  mediaAvaliacao: number | null = null;
  totalAvaliacoes: number = 0;
  logado = false;
  userId: number | null = null;
  user!: User;
  Recipes: Recipes[] = [];
  avaliacaoLoading = false;

  constructor(
    private auth: AuthService,
    private favoritoService: FavoritoService,
    private avaliacaoService: AvaliacaoService,
    private router: Router,
    private modalService: ModalService,
    private toastService: ToastService,
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (!changes['recipe'] || !this.recipe?.id) return;

    // garante que só roda no navegador
    if (typeof window === 'undefined') return;

    this.logado = this.auth.isLoggedIn();

    const userData = localStorage.getItem('user');
    if (!userData) return;

    const parsedUser = JSON.parse(userData);
    this.userId = Number(parsedUser.id);

    this.favoritoService
      .isFavorita(this.userId, Number(this.recipe.id))
      .subscribe({
        next: (res) => {
          this.isFavorite = res.favorite;
        },
        error: (err) => {
          console.error('Erro ao verificar favorito', err);
        },
      });

    this.carregarAvaliacao();
  }

  carregarAvaliacao() {
    if (!this.recipe?.id) return;
    const idReceita = Number(this.recipe.id);
    if (this.userId) {
      this.avaliacaoService.buscar(this.userId, idReceita).subscribe({
        next: (res) => {
          this.notaUsuario = res.nota;
          this.mediaAvaliacao = res.media;
          this.totalAvaliacoes = res.total;
        },
        error: () => {},
      });
    } else {
      // Usuário não logado: busca só a média
      this.avaliacaoService.buscar(0, idReceita).subscribe({
        next: (res) => {
          this.mediaAvaliacao = res.media;
          this.totalAvaliacoes = res.total;
        },
        error: () => {},
      });
    }
  }

  onAvaliar(nota: number | null) {
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
    const idReceita = Number(this.recipe.id);
    this.avaliacaoLoading = true;

    if (nota === null) {
      this.avaliacaoService.remover(this.userId, idReceita).subscribe((res) => {
        this.notaUsuario = null;
        this.mediaAvaliacao = res.media ?? null;
        this.totalAvaliacoes = res.total;
        this.avaliacaoLoading = false;
        this.toastService.show('Avaliação removida.', 'info');
      });
    } else {
      this.avaliacaoService
        .avaliar(this.userId, idReceita, nota)
        .subscribe((res) => {
          this.notaUsuario = nota;
          this.mediaAvaliacao = res.media;
          this.totalAvaliacoes = res.total;
          this.avaliacaoLoading = false;
          this.toastService.show(
            `Avaliação registrada! ${'⭐'.repeat(nota)}`,
            'success',
          );
        });
    }
  }

  toggleFavorito() {
    if (!this.userId) {
      this.router.navigate(['/login']);
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
      alert('Link copiado!');
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = url;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    alert('Link copiado!');
  }
}
