import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';

@Component({
  selector: 'bra-recipe-images',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './recipe-images.html',
  styleUrls: ['./recipe-images.scss'],
})
export class RecipeImages {
  imageList = [
    'assets/imagens/receita/delicioso-arranjo-de-doces-mexicanos (1).jpg',
    'assets/imagens/receita/delicioso-arranjo-de-doces-mexicanos (2).jpg',
    'assets/imagens/receita/delicioso-arranjo-de-doces-mexicanos.jpg'
  ];

  currentIndex = signal(0);
  isLightboxOpen = false;

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
    this.currentIndex.set(
      (this.currentIndex() + 1) % this.imageList.length
    );
  }
}
