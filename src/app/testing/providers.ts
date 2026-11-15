import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

/**
 * Providers que quase todo componente/serviço do app precisa nos testes:
 * HttpClient (simulado, sem rede) e Router/ActivatedRoute.
 */
export const providersDeTeste = [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([]),
];
