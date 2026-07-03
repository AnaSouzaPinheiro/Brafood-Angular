import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { InstagramEmbedService } from '../../services/instagram-embed/instagram-embed.service';
import { TiktokEmbedService } from '../../services/tiktok-embed/tiktok-embed.service';
import {
    VideoEmbedService,
    VideoInfo,
} from '../../services/video-embed/video-embed.service';

@Component({
  selector: 'bra-video-embed',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './video-embed.html',
  styleUrl: './video-embed.scss',
})
export class VideoEmbed implements OnChanges {
  @Input() url: string | null | undefined;

  info: VideoInfo | null = null;
  safeEmbedUrl: SafeResourceUrl | null = null;

  constructor(
    private videoEmbedService: VideoEmbedService,
    private instagramEmbedService: InstagramEmbedService,
    private tiktokEmbedService: TiktokEmbedService,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['url']) return;

    this.info = this.videoEmbedService.analisar(this.url);
    this.safeEmbedUrl = this.info?.embedUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(this.info.embedUrl)
      : null;

    if (this.info?.plataforma === 'instagram') {
      setTimeout(() => this.instagramEmbedService.carregarEProcessar(), 0);
    }

    if (this.info?.plataforma === 'tiktok') {
      setTimeout(() => this.tiktokEmbedService.carregarEProcessar(), 0);
    }
  }

  get nomePlataforma(): string {
    switch (this.info?.plataforma) {
      case 'youtube':
        return 'YouTube';
      case 'tiktok':
        return 'TikTok';
      case 'instagram':
        return 'Instagram';
      default:
        return 'link externo';
    }
  }

  get iconePlataforma(): string {
    switch (this.info?.plataforma) {
      case 'youtube':
        return 'fa-brands fa-youtube';
      case 'tiktok':
        return 'fa-brands fa-tiktok';
      case 'instagram':
        return 'fa-brands fa-instagram';
      default:
        return 'fa-solid fa-video';
    }
  }
}