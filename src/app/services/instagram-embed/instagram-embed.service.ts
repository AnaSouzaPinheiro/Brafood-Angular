import { Injectable } from '@angular/core';

declare global {
  interface Window {
    instgrm?: {
      Embeds: { process: () => void };
    };
  }
}

// Widget oficial do Instagram (mesmo mecanismo do botão "Incorporar" de um post).
// Não usa a Graph API — só injeta o script e deixa ele processar os
// <blockquote class="instagram-media"> presentes na página.
const SCRIPT_ID = 'instagram-embed-script';
const SCRIPT_SRC = 'https://www.instagram.com/embed.js';

@Injectable({
  providedIn: 'root',
})
export class InstagramEmbedService {
  private carregando: Promise<void> | null = null;

  private carregarScript(): Promise<void> {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return Promise.resolve();
    }

    if (window.instgrm?.Embeds) {
      return Promise.resolve();
    }

    if (this.carregando) {
      return this.carregando;
    }

    this.carregando = new Promise((resolve) => {
      const existente = document.getElementById(
        SCRIPT_ID,
      ) as HTMLScriptElement | null;

      if (existente) {
        existente.addEventListener('load', () => resolve());
        // Se o script já carregou antes desse listener ser anexado
        if (window.instgrm?.Embeds) resolve();
        return;
      }

      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = SCRIPT_SRC;
      script.onload = () => resolve();
      // Se o script falhar (ex: bloqueado por adblock), resolvemos mesmo
      // assim — o link de fallback dentro do blockquote continua visível.
      script.onerror = () => resolve();
      document.body.appendChild(script);
    });

    return this.carregando;
  }

  /**
   * Carrega o embed.js (se ainda não estiver carregado) e manda ele
   * (re)processar os blockquotes do Instagram presentes no DOM.
   */
  async carregarEProcessar(): Promise<void> {
    await this.carregarScript();
    window.instgrm?.Embeds?.process();
  }
}