import { Component, Input } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';

@Component({
  selector: 'bra-recipe-resume',
  standalone: true,
  imports: [CommonModule, NgClass],
  templateUrl: './recipe-resume.html',
  styleUrl: './recipe-resume.scss',
})
export class RecipeResume {
  @Input() type: 'banner' | 'card' = 'banner';
  @Input() resume!: { 
    title: string; 
    qtdFav: number; 
    text: string 
  };

  getClasses() {
    return { [this.type]: true };
  }
}
