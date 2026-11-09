import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { Section } from '../../model/section-home';
import { MediaUrlPipe } from '../pipes/media-url.pipe';

@Component({
  selector: 'bra-recipe-section',
  standalone: true,
  imports: [RecipeCard, CommonModule, MediaUrlPipe],
  templateUrl: './recipe-section.html',
  styleUrls: ['./recipe-section.scss'],
})
export class RecipeSection implements AfterViewInit {
  /**
   * Fundo claro: sem imagem e sem cor, ou com uma cor quase branca
   * (ex.: #F4F7FF). A home põe uma divisória entre duas seções assim.
   */
  @HostBinding('class.fundo-claro') get fundoClaro(): boolean {
    if (this.section?.urlSection) return false;
    const cor = this.section?.corFundo;
    if (!cor) return true;
    const hex = /^#?([0-9a-f]{6})$/i.exec(cor.trim())?.[1];
    if (!hex) return false;
    const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16));
    return 0.299 * r + 0.587 * g + 0.114 * b > 225;
  }

  @Input() section!: Section;

  @ViewChild('slider')
  slider!: ElementRef<HTMLDivElement>;

  isDragging = false;
  startX = 0;
  initalScrollLeft = 0;
  showLeftArrow = false;
  showRightArrow = true;

  getTituloStyle(): Record<string, string> {
    const tipo = this.section?.tituloCorTipo ?? 'gradiente';

    if (tipo === 'solido') {
      const cor = this.section.tituloCorSolid || '#0049ff';
      return { color: cor, webkitTextFillColor: cor };
    }

    const c1 = this.section.tituloGradiente1 || '#8aabff';
    const c2 = this.section.tituloGradiente2 || '#0049ff';
    return {
      backgroundImage: `linear-gradient(180deg, ${c1} 0%, ${c2} 100%)`,
      backgroundClip: 'text',
      webkitBackgroundClip: 'text',
      color: 'transparent',
      webkitTextFillColor: 'transparent',
    };
  }

  startDrag(event: MouseEvent) {
    this.isDragging = true;

    const slider = this.slider.nativeElement;

    this.startX = event.pageX - slider.offsetLeft;
    this.initalScrollLeft = slider.scrollLeft;
  }

  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;

    event.preventDefault();

    const slider = this.slider.nativeElement;
    const x = event.pageX - slider.offsetLeft;
    const walk = (x - this.startX) * 1.5;

    slider.scrollLeft = this.initalScrollLeft - walk;
  }

  stopDrag() {
    this.isDragging = false;
  }

  scrollRight() {
    const slider = this.slider.nativeElement;

    slider.scrollBy({
      left: 350,
      behavior: 'smooth',
    });

    setTimeout(() => {
      this.checkArrows();
    }, 400);
  }

  scrollLeft() {
    const slider = this.slider.nativeElement;

    slider.scrollBy({
      left: -350,
      behavior: 'smooth',
    });

    setTimeout(() => {
      this.checkArrows();
    }, 400);
  }

  checkArrows() {
    const slider = this.slider.nativeElement;

    this.showLeftArrow = slider.scrollLeft > 10;

    this.showRightArrow =
      slider.scrollLeft + slider.clientWidth < slider.scrollWidth - 10;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.checkArrows();
    });
  }
}
