import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export abstract class BaseService {
  protected readonly API =
    `${environment.apiUrl}/BraFood/BraFood-PHP/routes`;

  protected httpClient = inject(HttpClient);

  protected url(path: string): string {
    return `${this.API}/${path}`;
  }
}