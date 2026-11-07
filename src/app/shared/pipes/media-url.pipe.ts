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

  /**
   * @param variante 'thumb' troca uploads/receitas/x.jpg pela miniatura
   *   uploads/receitas/thumbs/x.jpg.webp (600x420, gerada sob demanda
   *   pelo thumb.php). Outros caminhos não são afetados.
   */
  transform(value: string | null | undefined, variante?: 'thumb'): string | null {
    if (!value) return null;

    if (variante === 'thumb') {
      value = value.replace(/(^|\/)uploads\/receitas\/([^/]+)$/, '$1uploads/receitas/thumbs/$2.webp');
    }

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
    // Uploads do admin salvam "api/uploads/..." (relativo à raiz do site);
    // o apiUrl já aponta para a pasta da API, então remove o "api/" para
    // não gerar ".../api/api/uploads/...".
    return `${this.base}/${value.replace(/^\/?api\//, '')}`;
  }
}
