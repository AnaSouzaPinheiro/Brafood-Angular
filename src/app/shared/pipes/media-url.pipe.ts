import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Converte caminhos relativos vindos do banco (ex: "uploads/receitas/foto.jpg")
 * em URLs absolutas usando o apiUrl do environment.
 *
 * Também aceita:
 * - null / undefined / string vazia → retorna null (sem src)
 * - URLs absolutas já formadas (http/https) → retorna sem alteração
 * - Caminhos de assets locais (assets/...) → retorna sem alteração
 *
 * Uso no template:
 *   <img [src]="receita.imagem1 | mediaUrl" />
 *   <img [src]="usuario.foto_perfil | mediaUrl" />
 */
@Pipe({
  name: 'mediaUrl',
  standalone: true,
})
export class MediaUrlPipe implements PipeTransform {
  private readonly base = environment.apiUrl.replace(/\/$/, '');

  transform(value: string | null | undefined): string | null {
    if (!value) return null;

    // Já é URL absoluta, data URL (preview local) ou caminho de asset → não altera
    if (
      value.startsWith('http://') ||
      value.startsWith('https://') ||
      value.startsWith('data:') ||
      value.startsWith('assets/')
    ) {
      return value;
    }

    // Caminho relativo do banco → prefixar com apiUrl + caminho do projeto PHP
    // ex: "uploads/receitas/foto.jpg"
    return `${this.base}/BraFood/BraFood-PHP/${value}`;
  }
}
