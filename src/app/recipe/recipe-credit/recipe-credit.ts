import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { VideoEmbedService } from '../../services/video-embed/video-embed.service';
import { VideoEmbed } from '../../shared/video-embed/video-embed';

@Component({
  selector: 'bra-recipe-credit',
  standalone: true,
  imports: [CommonModule, VideoEmbed],
  templateUrl: './recipe-credit.html',
  styleUrl: './recipe-credit.scss',
})
export class RecipeCredit {
  @Input() fonteAutor: string | null | undefined;
  @Input() fonteUrl: string | null | undefined;
  @Input() videoUrl: string | null | undefined;

  constructor(private videoEmbedService: VideoEmbedService) {}

  // TikTok e Instagram são verticais e ficam melhor ao lado do texto.
  // YouTube (horizontal) e links genéricos ficam centralizados embaixo.
  get videoVertical(): boolean {
    const info = this.videoEmbedService.analisar(this.videoUrl);
    return info?.plataforma === 'tiktok' || info?.plataforma === 'instagram';
  }
}