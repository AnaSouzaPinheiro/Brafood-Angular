import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ModalService } from '../modal/modal.service';

/** Página com formulário que pode ter alterações não salvas. */
export interface ComAlteracoes {
  temAlteracoes(): boolean;
  /** Texto do aviso; se não houver, usa o padrão. */
  avisoSaida?(): string;
}

/** Pergunta antes de sair de uma página com alterações não salvas. */
export const alteracoesGuard: CanDeactivateFn<ComAlteracoes> = (pagina) => {
  if (!pagina?.temAlteracoes?.()) return true;
  const modal = inject(ModalService);

  return new Promise<boolean>((resolve) => {
    modal.open({
      type: 'confirm',
      title: 'Sair sem salvar?',
      message:
        pagina.avisoSaida?.() ??
        'As alterações que você fez nesta receita serão perdidas.',
      confirmText: 'Sair',
      cancelText: 'Continuar editando',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false),
    });
  });
};
