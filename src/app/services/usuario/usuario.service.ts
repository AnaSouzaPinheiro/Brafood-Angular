import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserResponse } from '../../model/user';
import { BaseService } from '../base/base.service';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService extends BaseService {
  // Busca receita específica pelo ID
  buscarUserPorId(id: number): Observable<UserResponse> {
    return this.httpClient.get<UserResponse>(this.url(`user.php?id=${id}`));
  }

  editarUsuario(id: number, formValue: any, imagem?: File): Observable<any> {
    const formData = new FormData();

    formData.append('dados', JSON.stringify(formValue));

    if (imagem) {
      formData.append('foto_perfil', imagem);
    }

    return this.httpClient.post<any>(
      this.url(`updateUser.php?id=${id}`),
      formData,
    );
  }
}
