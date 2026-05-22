import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { ApiResponse } from '../../model/api-response';

@Injectable({ providedIn: 'root' })
export class NewsletterService extends BaseService {
  inscrever(email: string): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(this.url('newsletter.php'), {
      email,
    });
  }

  cancelar(email: string): Observable<ApiResponse> {
    return this.httpClient.delete<ApiResponse>(this.url('newsletter.php'), {
      body: { email },
    });
  }
}
