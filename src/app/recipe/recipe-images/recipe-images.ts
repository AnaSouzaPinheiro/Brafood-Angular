import { CommonModule } from '@angular/common';
import { Component, Input, signal } from '@angular/core';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';

@Component({
  selector: 'bra-recipe-images',
  standalone: true,
  imports: [CommonModule, MediaUrlPipe],
  templateUrl: './recipe-images.html',
  styleUrls: ['./recipe-images.scss'],
})
export class RecipeImages {
  @Input() images!: any;
  currentIndex = signal(0);
  isLightboxOpen = false;

  get imageList() {
    return [this.images?.imagem1, ...(this.images?.imagens ?? [])].filter(
      Boolean,
    );
  }

  openLightbox(index: number) {
    this.currentIndex.set(index);
    this.isLightboxOpen = true;
  }

  closeLightbox() {
    this.isLightboxOpen = false;
  }

  prevImage() {
    this.currentIndex.set(
      (this.currentIndex() - 1 + this.imageList.length) % this.imageList.length
    );
  }

  nextImage() {
    this.currentIndex.set((this.currentIndex() + 1) % this.imageList.length);
  }
}
