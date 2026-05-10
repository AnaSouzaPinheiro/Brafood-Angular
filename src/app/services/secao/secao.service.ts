import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Section } from '../../model/section-home';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class SecaoService extends BaseService {
  getSecoes(): Observable<Section[]> {
    return this.httpClient.get<Section[]>(this.url(`secoes_carrossel.php`));
  }
}
