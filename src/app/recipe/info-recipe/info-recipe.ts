import { Component, Input, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { HoverThings } from '../hover-things/hover-things';
import { User } from '../../model/user';
import { MyRecipesService } from '../../services/my-recipes';
import { Auth } from '../../services/auth';
import { Router } from '@angular/router';
import { Recipes } from '../../model/myrecipes';

@Component({
  selector: 'bra-info-recipe',
  standalone: true,
  imports: [NgFor, CustomButton, HoverThings],
  templateUrl: './info-recipe.html',
  styleUrl: './info-recipe.scss',
})
export class InfoRecipe {
  @Input() recipe!: any;

  get mappedInfoRecipe() {
    return {
      titulo: this.recipe?.titulo,
      categoria: [this.recipe?.categoria],
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
    private service: MyRecipesService, 
    private auth: Auth,
    private router: Router
  ) {}

  ngOnInit() {
    // garante que só roda no navegador
    if (typeof window === 'undefined') return;

    this.logado = this.auth.isLoggedIn();

    const userData = localStorage.getItem('user');
    if (!userData) return;

    const parsedUser = JSON.parse(userData);
    this.userId = Number(parsedUser.id);

    // 🔹 verifica se a receita já é favorita
    this.service.isFavorita(this.userId, Number(this.recipe.id)).subscribe({
      next: (res) => {
        this.isFavorite = res.favorite;
      },
      error: (err) => {
        console.error('ERRO AQUI NÃO PODE MAIS ACONTECER', err);
      },
    });
  }

  toggleFavorito() {
    if (!this.userId) {
      this.router.navigate(['/login']) 
      return;
    }

    const userIdNum = this.userId;
    const receitaIdNum = Number(this.recipe.id);

    this.service.isFavorita(userIdNum, receitaIdNum).subscribe((res) => {
      if (res.favorite) {
        this.service.desfavoritar(userIdNum, receitaIdNum).subscribe(() => {
          this.isFavorite = false; // 🔹 AQUI
        });
      } else {
        this.service.favoritar(userIdNum, receitaIdNum).subscribe(() => {
          this.isFavorite = true; // 🔹 AQUI
        });
      }
    });
  }
}
