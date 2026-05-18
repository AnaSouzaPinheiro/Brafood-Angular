import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from '../base/base.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class AdminUploadService extends BaseService {

  uploadImagem(
    arquivo: File,
    contexto: 'categorias' | 'secoes',
    userId: number
  ): Observable<{ caminho: string }> {
    const formData = new FormData();
    formData.append('imagem', arquivo);

    return this.httpClient.post<{ caminho: string }>(
      this.url(`admin/upload_imagem.php?contexto=${contexto}`),
      formData,
      { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) }
    );
  }
}
