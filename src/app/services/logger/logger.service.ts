import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Ponto único de log do app. Em produção não solta nada no console do
 * navegador (evita vazar detalhe interno pra quem abrir o DevTools);
 * em dev, loga normal. Quando quiser mandar erro pra um serviço externo
 * (Sentry, LogRocket etc), é só plugar aqui dentro — não precisa mexer
 * em cada componente que usa.
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  error(message: string, err?: unknown): void {
    if (!environment.production) {
      console.error(message, err ?? '');
    }
  }

  warn(message: string, details?: unknown): void {
    if (!environment.production) {
      console.warn(message, details ?? '');
    }
  }
}
