import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth/auth.service';

/**
 * Anexa `Authorization: Bearer <token>` em toda requisição, quando existir
 * um usuário logado. Centraliza isso aqui em vez de cada service montar o
 * header manualmente — um lugar só pra manter e pra nunca esquecer numa
 * rota nova.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getToken();

  if (!token) {
    return next(req);
  }

  const authReq = req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });

  return next(authReq);
};
