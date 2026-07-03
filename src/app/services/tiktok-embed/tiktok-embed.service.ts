import { Injectable } from '@angular/core';

// Widget oficial do TikTok (oEmbed). Assim como o Instagram, o embed direto
// via iframe (tiktok.com/embed/v2/{id}) não é o método suportado e costuma
// vir em branco/bloqueado. O jeito oficial é injetar o script embed.js e
// deixar ele processar os <blockquote class="tiktok-embed"> da página.
//
// Diferente do Instagram, o TikTok não expõe um método documentado tipo
// `window.instgrm.Embeds.process()` pra reprocessar sob demanda — o script
// só hidrata os blockquotes que existem no DOM no momento em que ELE
// carrega. Por isso, a cada troca de vídeo, removemos o script antigo e
// injetamos de novo com um parâmetro de cache-busting, forçando o browser
// a executá-lo novamente contra o blockquote atual.
const SCRIPT_ID = 'tiktok-embed-script';
const SCRIPT_SRC = 'https://www.tiktok.com/embed.js';

@Injectable({
  providedIn: 'root',
})
export class TiktokEmbedService {
  carregarEProcessar(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    const existente = document.getElementById(SCRIPT_ID);
    existente?.remove();

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = `${SCRIPT_SRC}?t=${Date.now()}`;
    document.body.appendChild(script);
  }
}