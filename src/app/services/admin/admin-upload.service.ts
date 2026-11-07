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
    contexto: 'categorias' | 'icone' | 'secoes',
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

  /** IA (OpenRouter): sugere ícones (em inglês) e até 3 cores para o padrão doodle da seção. */
  sugerirIconesIa(tema: string, contexto: string, userId: number): Observable<{ icones: string; cores: string[] }> {
    return this.httpClient.post<{ icones: string; cores: string[] }>(
      this.url('admin/gerar_imagem.php'),
      { acao: 'icones', tema, contexto },
      { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) }
    );
  }

  /** IA (Pollinations): gera uma opção de imagem. Volta como data URL, sem salvar. */
  gerarImagemIa(
    dados: { tipo: 'fundo' | 'titulo'; tema: string; icones: string; cores: string[]; seed: number },
    userId: number
  ): Observable<{ imagem: string }> {
    return this.httpClient.post<{ imagem: string }>(
      this.url('admin/gerar_imagem.php'),
      { acao: 'imagem', ...dados },
      { headers: new HttpHeaders({ 'X-User-Id': String(userId) }) }
    );
  }
}
