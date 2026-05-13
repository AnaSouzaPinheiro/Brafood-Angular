import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { NgFor } from '@angular/common';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { HoverThings } from '../hover-things/hover-things';
import { User } from '../../model/user';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { Recipes } from '../../model/myrecipes';
import { FavoritoService } from '../../services/favorito/favorito.service';

@Component({
  selector: 'bra-info-recipe',
  standalone: true,
  imports: [NgFor, CustomButton, HoverThings],
  templateUrl: './info-recipe.html',
  styleUrl: './info-recipe.scss',
})
export class InfoRecipe implements OnChanges {
  @Input() recipe!: any;

  get mappedInfoRecipe() {
    return {
      titulo: this.recipe?.titulo,
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
  logado = false;
  userId: number | null = null;
  user!: User;
  Recipes: Recipes[] = [];

  constructor(
    private auth: AuthService,
    private favoritoService: FavoritoService,
    private router: Router,
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
