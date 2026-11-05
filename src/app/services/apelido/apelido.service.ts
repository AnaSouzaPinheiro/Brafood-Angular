import { Injectable } from '@angular/core';
import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, catchError, map, of, switchMap, timer } from 'rxjs';
import { BaseService } from '../base/base.service';

export interface VerificacaoApelido {
  valido: boolean;
  disponivel: boolean;
  mensagem: string;
}

/** Mesmas regras do back-end (ApelidoService.php) */
export const APELIDO_REGEX = /^(?!\.)(?!.*\.\.)[a-z0-9_.]{3,30}(?<!\.)$/;

export const APELIDO_ERROS: Record<string, string> = {
  required: 'Informe um apelido.',
  minlength: 'O apelido precisa ter pelo menos 3 caracteres.',
  maxlength: 'O apelido pode ter no máximo 30 caracteres.',
  apelidoFormato:
    'Use letras minúsculas, números, "_" e "." (sem ponto no início, no fim ou repetido).',
  apelidoEmUso: 'Este apelido já está em uso.',
  apelidoInvalido: 'Apelido inválido.',
};

/** Validação de formato (síncrona) */
export const apelidoFormatoValidator: ValidatorFn = (
  control: AbstractControl,
): ValidationErrors | null => {
  const v = (control.value ?? '') as string;
  if (!v || v.length < 3 || v.length > 30) return null; // required/min/max cuidam
  return APELIDO_REGEX.test(v) ? null : { apelidoFormato: true };
};

/** "Ana Letícia" → "ana.leticia" (prévia local; o servidor garante a unicidade) */
export function normalizarApelido(texto: string): string {
  return (texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9_.]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .slice(0, 30);
}

@Injectable({ providedIn: 'root' })
export class ApelidoService extends BaseService {
  verificar(apelido: string): Observable<VerificacaoApelido> {
    return this.httpClient.get<VerificacaoApelido>(
      this.url(`apelido.php?verificar=${encodeURIComponent(apelido)}`),
    );
  }

  sugerir(nome: string): Observable<string> {
    return this.httpClient
      .get<{ sugestao: string }>(this.url(`apelido.php?sugerir=${encodeURIComponent(nome)}`))
      .pipe(map((r) => r.sugestao));
  }

  /**
   * Validador assíncrono: consulta o servidor 400ms depois que a pessoa
   * para de digitar. Se o servidor falhar, não bloqueia o formulário
   * (o back-end valida de novo ao salvar).
   */
  disponivelValidator(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
      const v = (control.value ?? '') as string;
      if (!v || !APELIDO_REGEX.test(v)) return of(null);

      return timer(400).pipe(
        switchMap(() => this.verificar(v)),
        map((r) => {
          if (!r.valido) return { apelidoInvalido: true };
          return r.disponivel ? null : { apelidoEmUso: true };
        }),
        catchError(() => of(null)),
      );
    };
  }
}
