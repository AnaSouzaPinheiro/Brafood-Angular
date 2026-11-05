import { Component, Input } from '@angular/core';

export type AlertType = 'success' | 'error' | 'warning' | 'info';

/**
 * Alerta inline padrão do BraFood, para o resultado de um formulário
 * (ex.: "Enviamos um link para seu e-mail", "E-mail ou senha incorretos").
 *
 * Padrão de feedback do site:
 *   - erro de um campo específico → mensagem vermelha embaixo do campo (.field-error)
 *   - resultado de um formulário  → <bra-alert> (este componente)
 *   - ação importante concluída   → ModalService (bra-modal-feedback)
 *   - confirmação rápida          → ToastService (ex.: "Link copiado")
 *
 * Uso: <bra-alert type="success">Texto</bra-alert>
 */
@Component({
  selector: 'bra-alert',
  template: `
    <div
      class="bra-alert"
      [class]="'bra-alert bra-alert--' + type"
      [attr.role]="type === 'error' || type === 'warning' ? 'alert' : 'status'"
      [attr.aria-live]="type === 'error' || type === 'warning' ? 'assertive' : 'polite'"
    >
      <i class="fa-solid bra-alert__icon" [class]="'fa-solid bra-alert__icon ' + icon" aria-hidden="true"></i>
      <div class="bra-alert__text"><ng-content></ng-content></div>
    </div>
  `,
  styleUrl: './alert.scss',
})
export class BraAlert {
  @Input() type: AlertType = 'info';

  get icon(): string {
    switch (this.type) {
      case 'success':
        return 'fa-circle-check';
      case 'error':
        return 'fa-circle-xmark';
      case 'warning':
        return 'fa-triangle-exclamation';
      default:
        return 'fa-circle-info';
    }
  }
}
