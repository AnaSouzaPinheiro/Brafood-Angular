import { Injectable } from '@angular/core';

export type VideoPlatform = 'youtube' | 'tiktok' | 'instagram' | 'desconhecida';

export interface VideoInfo {
  plataforma: VideoPlatform;
  // URL pronta pra colocar num <iframe src="...">. Nula quando a plataforma
  // não permite embed simples (ex: Instagram, TikTok) — nesse caso exibimos
  // o widget oficial (blockquote) ou um card com link.
  embedUrl: string | null;
  originalUrl: string;
  // Só preenchido pro TikTok: precisa do ID pro atributo data-video-id do
  // blockquote oficial.
  videoId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class VideoEmbedService {
  analisar(url: string | null | undefined): VideoInfo | null {
    if (!url) return null;

    const limpa = url.trim();
    if (!limpa) return null;

    const youtube = this.tentarYoutube(limpa);
    if (youtube) return youtube;

    const tiktok = this.tentarTiktok(limpa);
    if (tiktok) return tiktok;

    const instagram = this.tentarInstagram(limpa);
    if (instagram) return instagram;

    return { plataforma: 'desconhecida', embedUrl: null, originalUrl: limpa };
  }

  private tentarYoutube(url: string): VideoInfo | null {
    // Cobre: youtube.com/watch?v=ID, youtu.be/ID, youtube.com/shorts/ID
    const padroes = [
      /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
      /(?:youtu\.be\/)([\w-]{11})/,
      /(?:youtube\.com\/shorts\/)([\w-]{11})/,
    ];

    for (const padrao of padroes) {
      const match = url.match(padrao);
      if (match) {
        return {
          plataforma: 'youtube',
          // youtube-nocookie.com = modo de privacidade reforçada do
          // próprio YouTube: dispara bem menos chamadas de telemetria
          // (menos coisa pra ad-blocker bloquear) e é mais raramente
          // alvo de listas de bloqueio de privacidade.
          embedUrl: `https://www.youtube.com/embed/${match[1]}`,
          originalUrl: url,
        };
      }
    }
    return null;
  }

  private tentarTiktok(url: string): VideoInfo | null {
    // Cobre: tiktok.com/@usuario/video/ID
    // OBS: o iframe direto (tiktok.com/embed/v2/ID) não é o método oficial
    // suportado e costuma vir em branco. Aqui só extraímos o ID pra usar no
    // blockquote oficial (widget renderizado pelo TiktokEmbedService).
    const match = url.match(/tiktok\.com\/@[\w.-]+\/video\/(\d+)/);
    if (match) {
      return {
        plataforma: 'tiktok',
        embedUrl: null,
        originalUrl: url,
        videoId: match[1],
      };
    }
    return null;
  }

  private tentarInstagram(url: string): VideoInfo | null {
    // Cobre: instagram.com/reel/ID ou /p/ID — Instagram não libera iframe
    // direto sem token de API, então aqui só confirmamos que é do Instagram.
    const match = url.match(/instagram\.com\/(?:reel|p)\/[\w-]+/);
    if (match) {
      return {
        plataforma: 'instagram',
        embedUrl: null,
        originalUrl: url,
      };
    }
    return null;
  }
}