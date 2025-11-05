import {
  Component,
  Input,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { signal } from '@angular/core';
import { BannerHome } from '../banner-home/banner-home';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-slide-home',
  standalone: true,
  imports: [BannerHome, CommonModule],
  templateUrl: './slide-home.html',
  styleUrls: ['./slide-home.scss'],
})
export class SlideHome implements OnDestroy {
  @Input() recipes: any[] = [];

  currentIndex = signal(0);
  private intervalId?: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  get currentRecipe(): any | undefined {
    return this.recipes[this.currentIndex()];
  }

  ngOnInit() {
    this.startSlide();
  }

  startSlide() {
    if (isPlatformBrowser(this.platformId) && this.recipes.length > 0) {
      this.intervalId = window.setInterval(() => {
        this.currentIndex.set((this.currentIndex() + 1) % this.recipes.length);
      }, 8000);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
