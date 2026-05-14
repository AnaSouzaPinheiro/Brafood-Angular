import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class AiService extends BaseService {
  generate(texto: string): Observable<any> {
    return this.httpClient.post(this.url('ai/gerar-receita.php'), {
      texto: texto,
    });
  }
}
