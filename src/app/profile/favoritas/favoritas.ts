import { Component } from '@angular/core';
import { Perfil } from '../perfil/perfil';
import { Router, RouterModule } from '@angular/router';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { MyRecipesService } from '../../services/my-recipes';
import { Recipes } from '../../model/myrecipes';
import { Auth } from '../../services/auth';
import { User } from '../../model/user';

@Component({
  selector: 'bra-favoritas',
  standalone: true,
  imports: [Perfil, RecipeCard, RouterModule],
  templateUrl: './favoritas.html',
  styleUrl: './favoritas.scss',
})
export class Favoritas {
  indice!: number;
  currentPage!: number;

  Recipes: Recipes[] = [];

  logado = false;
  userId: string | null = null;
  user!: User;

  constructor(
    private myRecipesServices: MyRecipesService,
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;

    // 🚨 garante que está no browser
    if (typeof window === 'undefined') return;

    this.logado = this.auth.isLoggedIn();

    const userData = localStorage.getItem('user');
    if (!userData) return;

    this.userId = JSON.parse(userData).id;

    this.myRecipesServices
      .listarFavoritos(Number(this.userId))
      .subscribe((data) => {
        this.Recipes = Array.isArray(data) ? data : [];
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
