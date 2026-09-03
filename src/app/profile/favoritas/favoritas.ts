import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Recipes } from '../../model/myrecipes';
import { User } from '../../model/user';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { AuthService } from '../../services/auth/auth.service';
import { FavoritoService } from '../../services/favorito/favorito.service';
import { RecipeCardSkeleton } from '../../shared/recipe-card-skeleton/recipe-card-skeleton';
import { Perfil } from '../perfil/perfil';

@Component({
  selector: 'bra-favoritas',
  standalone: true,
  imports: [Perfil, RecipeCard, RecipeCardSkeleton, RouterModule, CommonModule],
  templateUrl: './favoritas.html',
  styleUrl: './favoritas.scss',
})
export class Favoritas {
  indice!: number;
  currentPage!: number;

  Recipes: Recipes[] = [];
  loadingFavoritas = true;

  logado = false;
  userId: string | null = null;
  user!: User;

  constructor(
    private favoritoService: FavoritoService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;

    // garante que está no browser
    if (typeof window === 'undefined') return;

    this.logado = this.auth.isLoggedIn();

    const usuarioLogado = this.auth.user();
    if (!usuarioLogado) {
      this.loadingFavoritas = false;
      return;
    }

    this.userId = usuarioLogado.id;

    this.favoritoService
      .listarFavoritos(Number(this.userId))
      .subscribe({
        next: (data) => {
          this.Recipes = Array.isArray(data) ? data : [];
          this.loadingFavoritas = false;
        },
        error: () => {
          this.loadingFavoritas = false;
        },
      });
  }

  get myRecipesPage() {
    return this.Recipes.slice(this.indice, this.indice + 6);
  }

  get pages(): number {
    return Math.ceil(this.Recipes.length / 6);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }

  nextPage() {
    let newIndex = this.indice + 6;
    if (newIndex >= this.Recipes.length) {
      newIndex = 0;
    }
    this.indice = newIndex;
    this.currentPage = this.indice / 6 + 1;
  }

  prevPage() {
    let newIndex = this.indice - 6;
    if (newIndex < 0) {
      newIndex = (this.pages - 1) * 6;
    }
    this.indice = newIndex;
    this.currentPage = this.indice / 6 + 1;
  }

  goToPage(page: number) {
    this.indice = (page - 1) * 6;
    this.currentPage = page;
  }
}