import { Injectable } from '@angular/core';

/**
 * Wrapper fino sobre localStorage com o guard de SSR (`typeof window`)
 * já embutido — pra ninguém precisar reimplementar essa checagem em
 * cada componente novo. Use isso pra dados que não são do usuário
 * logado (esses já ficam no AuthService); aqui é pra coisas como
 * preferências locais, rascunhos, flags de UI etc.
 */
@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly isBrowser = typeof window !== 'undefined';

  getItem(key: string): string | null {
    return this.isBrowser ? localStorage.getItem(key) : null;
  }

  setItem(key: string, value: string): void {
    if (this.isBrowser) {
      localStorage.setItem(key, value);
    }
  }

  removeItem(key: string): void {
    if (this.isBrowser) {
      localStorage.removeItem(key);
    }
  }
}
