import { Component, HostListener, input, Input } from '@angular/core';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CommonModule } from '@angular/common';

export type modo = 'carrossel' | 'grid';

@Component({
  selector: 'bra-recipe-section',
  standalone: true,
  imports: [RecipeCard, CommonModule],
  templateUrl: './recipe-section.html',
  styleUrl: './recipe-section.scss',
})
export class RecipeSection {
  indice = 0;
  back1 = '';
  back2 = '';
  back3 = '';

  type = input('text');
  modo = input<modo>('carrossel');

  isMobile = false; // inicia com valor padrão

  @Input() section!: {
    title: string;
    urlSection: string;
    fundoTitle: string;
  };

  @Input() recipes: Array<{
    category: string;
    img: string;
    url: string;
    
    resume: { title: string; qtdFav: number; text: string };
  }> = [];

  ngOnInit() {
    // só roda no navegador
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 768;
    }
    this.atualizaCor(1);
  }

  @HostListener('window:resize')
  onResize() {
    if (typeof window !== 'undefined') {
      this.isMobile = window.innerWidth <= 1545;
    }
  }

  get recipesPage() {
    return this.isMobile
      ? this.recipes
      : this.recipes.slice(this.indice, this.indice + 3);
  }

  async preloadImages(urls: string[]) {
    await Promise.all(
      urls.map(
        (url) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.src = url;
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );
  }

  async nextPage() {
    let newIndex = this.indice + 3;
    if (newIndex >= this.recipes.length) {
      newIndex = 0;
    }

    const nextRecipes = this.recipes.slice(newIndex, newIndex + 3);
    await this.preloadImages(nextRecipes.map((r) => r.img));

    this.indice = newIndex;
    this.atualizaCor(Math.floor(this.indice / 3) + 1);
  }

  async prevPage() {
    let newIndex = this.indice - 3;
    if (newIndex < 0) {
      newIndex = this.recipes.length - 3;
    }

    const prevRecipes = this.recipes.slice(newIndex, newIndex + 3);
    await this.preloadImages(prevRecipes.map((r) => r.img));

    this.indice = newIndex;
    this.atualizaCor(Math.floor(this.indice / 3) + 1);
  }

  atualizaCor(qual: number) {
    this.back1 = qual === 1 ? '#002C99' : '';
    this.back2 = qual === 2 ? '#002C99' : '';
    this.back3 = qual === 3 ? '#002C99' : '';
  }

    getClasses() {
    return {
      [this.type()]: true,
    };
  }
}
