import { Component, HostListener, Input } from '@angular/core';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CommonModule } from '@angular/common';
import {  Section } from '../../recipe/model/section-home';
import { Recipes } from '../../recipe/model/myrecipes';

export type modo = 'carrossel' | 'grid';

@Component({
  selector: 'bra-recipe-section',
  standalone: true,
  imports: [RecipeCard, CommonModule],
  templateUrl: './recipe-section.html',
  styleUrls: ['./recipe-section.scss'],
})
export class RecipeSection {
  indice = 0;
  back1 = '';
  back2 = '';
  back3 = '';

  @Input() modo: modo = 'carrossel';
  @Input() type: string = ''; 

  @Input() section!: Section;

  isMobile = false; 

  ngOnInit() {
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

  get recipesPage(): Recipes[] {
    if (!this.section) return [];
    return this.isMobile
      ? this.section.recipes
      : this.section.recipes.slice(this.indice, this.indice + 3);
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
    if (!this.section) return;

    let newIndex = this.indice + 3;
    if (newIndex >= this.section.recipes.length) {
      newIndex = 0;
    }

    const nextRecipes = this.section.recipes.slice(newIndex, newIndex + 3);
    await this.preloadImages(nextRecipes.map((r) => r.img));

    this.indice = newIndex;
    this.atualizaCor(Math.floor(this.indice / 3) + 1);
  }

  async prevPage() {
    if (!this.section) return;

    let newIndex = this.indice - 3;
    if (newIndex < 0) {
      newIndex = this.section.recipes.length - 3;
    }

    const prevRecipes = this.section.recipes.slice(newIndex, newIndex + 3);
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
      [this.type]: true,
    };
  }
}
