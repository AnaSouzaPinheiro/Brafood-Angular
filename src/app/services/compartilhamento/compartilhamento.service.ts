import { Injectable } from '@angular/core';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class CompartilhamentoService extends BaseService {
  getLinkWhatsApp(ingredientes: any[]) {
    const link = typeof window !== 'undefined' ? window.location.href : '';

    return this.httpClient.get<string>(
      this.url(
        `compartilha_ingredientes.php?ingredientes=${encodeURIComponent(JSON.stringify(ingredientes))}&link=${encodeURIComponent(link)}`,
      ),
    );
  }
}
