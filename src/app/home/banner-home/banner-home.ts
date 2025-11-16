import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeResume } from '../../recipe/recipe-resume/recipe-resume';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'bra-banner-home',
  standalone: true,
  imports: [RecipeResume, CommonModule, RouterModule],
  templateUrl: './banner-home.html',
  styleUrl: './banner-home.scss',
})
export class BannerHome {
  @Input() recipe!: {
    img: string;
    url: string;
    resume: { 
      title: string; 
      qtdFav: number; 
      text: string 
    };
  };
}
