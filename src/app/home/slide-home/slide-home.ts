import { Component, Input, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
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
export class SlideHome implements OnInit, OnDestroy {
  @Input() recipes: any[] = []; // **DECLAÇÃO IMPORTANTE**

  currentIndex = signal(0);
  private intervalId?: number;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = window.setInterval(() => {
        if (this.recipes.length > 0) {
          this.currentIndex.set((this.currentIndex() + 1) % this.recipes.length);
        }
      }, 8000);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
