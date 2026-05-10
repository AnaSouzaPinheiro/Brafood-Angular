import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'bra-cookie-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss',
})
export class CookieBanner implements OnInit {
  accepted = false;
  loaded = false;

  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const acceptedCookies = localStorage.getItem('cookiesAccepted');

      this.accepted = acceptedCookies === 'true';
    }

    this.loaded = true;
  }

  accept(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    localStorage.setItem('cookiesAccepted', 'true');

    this.accepted = true;
  }
}
