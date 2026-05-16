import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponse } from '../../model/user';
import { BaseService } from '../base/base.service';
import { ApiResponse } from '../../model/api-response';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService extends BaseService {
  // Busca receita específica pelo ID
  buscarUserPorId(id: number): Observable<UserResponse> {
    return this.httpClient.get<UserResponse>(this.url(`user.php?id=${id}`));
  }

  editarUsuario(
    id: number,
    formValue: any,
    imagem?: File,
  ): Observable<ApiResponse> {
    const formData = new FormData();

    formData.append('dados', JSON.stringify(formValue));

    if (imagem) {
      formData.append('foto_perfil', imagem);
    }

    return this.httpClient.post<ApiResponse>(
      this.url(`updateUser.php?id=${id}`),
      formData,
    );
  }
}
