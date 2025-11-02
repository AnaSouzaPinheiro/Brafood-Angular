import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeResume } from '../../recipe/recipe-resume/recipe-resume';


@Component({
  selector: 'bra-banner-home',
  standalone: true,
  imports: [RecipeResume, CommonModule],
  templateUrl: './banner-home.html',
  styleUrl: './banner-home.scss',
})
export class BannerHome {
  @Input() recipe!: {
    bannerFoto: string;
    resume: { title: string; qtdFav: number; text: string };
    link: string;
  };
}
