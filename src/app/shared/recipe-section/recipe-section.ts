import {
  Component,
  Input,
  ElementRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
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
  @Input() section!: Section;

  @ViewChild('slider')
  slider!: ElementRef<HTMLDivElement>;

  isDragging = false;
  startX = 0;
  initalScrollLeft = 0;
  showLeftArrow = false;
  showRightArrow = true;

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
