import { Component, HostListener, Input, ElementRef, ViewChild } from '@angular/core';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { CommonModule } from '@angular/common';
import { Section } from '../../model/section-home';
import { Recipes } from '../../model/myrecipes';

export type modo = 'carrossel' | 'grid';

@Component({
  selector: 'bra-recipe-section',
  standalone: true,
  imports: [RecipeCard, CommonModule],
  templateUrl: './recipe-section.html',
  styleUrls: ['./recipe-section.scss'],
})
export class RecipeSection {
  @ViewChild('contentRef') contentRef!: ElementRef<HTMLDivElement>;

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

  animando = false;
  direcao: 'left' | 'right' = 'right';

  async nextPage() {
    if (this.animando || !this.section) return;
    this.direcao = 'right';
    await this.animateSlide();
  }

  async prevPage() {
    if (this.animando || !this.section) return;
    this.direcao = 'left';
    await this.animateSlide();
  }

  async animateSlide() {
    this.animando = true;

    const el = this.contentRef?.nativeElement;
    if (!el) return;

    // Etapa 1: anima a saída
    el.classList.add(
      this.direcao === 'right' ? 'slide-out-left' : 'slide-out-right'
    );

    await new Promise((r) => setTimeout(r, 400)); // tempo da animação

    // Troca o conteúdo após a saída
    let newIndex = this.indice + (this.direcao === 'right' ? 3 : -3);

    if (newIndex < 0) newIndex = this.section.recipes.length - 3;
    if (newIndex >= this.section.recipes.length) newIndex = 0;

    this.indice = newIndex;
    this.atualizaCor(Math.floor(this.indice / 3) + 1);

    // Remove animação antiga e adiciona a de entrada
    el.classList.remove('slide-out-left', 'slide-out-right');
    el.classList.add(
      this.direcao === 'right' ? 'slide-in-right' : 'slide-in-left'
    );
    
    await new Promise((r) => setTimeout(r, 400));

    // Limpa e libera nova animação
    el.classList.remove('slide-in-right', 'slide-in-left');
    this.animando = false;
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
