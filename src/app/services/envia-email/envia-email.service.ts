import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiResponse } from '../../model/api-response';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class EnviaEmailService extends BaseService {
  enviarEmail(formValue: any): Observable<ApiResponse> {
    return this.httpClient.post<ApiResponse>(
      this.url('envia_email.php'),
      formValue,
    );
  }
}
