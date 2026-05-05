import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-legal-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss'
})
export class LegalPage {
  @Input() title!: string;
  @Input() intro!: string;
  @Input() sections!: { title: string; content: string }[];
}
