import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-cookie-banner',
  imports: [CommonModule],
  templateUrl: './cookie-banner.html',
  styleUrl: './cookie-banner.scss'
})
export class CookieBanner implements OnInit {
  accepted = false;

  ngOnInit() {
    this.accepted = localStorage.getItem('cookiesAccepted') === 'true';
  }

  accept() {
    localStorage.setItem('cookiesAccepted', 'true');
    this.accepted = true;
  }
}