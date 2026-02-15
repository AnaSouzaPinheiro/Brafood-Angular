import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalService } from '../../services/modal-service';
import { ModalConfig } from '../../model/modal-feedback';

@Component({
  selector: 'bra-modal-feedback',
  imports: [CommonModule],
  templateUrl: './modal-feedback.html',
  styleUrl: './modal-feedback.scss',
})
export class ModalFeedback {
  modal: ModalConfig | null = null;

  constructor(private modalService: ModalService) {
    this.modalService.modal$.subscribe((m) => (this.modal = m));
  }

  close() {
    this.modalService.close();
    this.modal?.onCancel?.();
  }

  confirm() {
    this.modal?.onConfirm?.();
    this.modalService.close();
  }

  getIcon() {
    switch (this.modal?.type) {
      case 'success':
        return 'fa-circle-check';
      case 'error':
        return 'fa-circle-xmark';
      case 'warning':
        return 'fa-triangle-exclamation';
      case 'confirm':
        return 'fa-circle-question';
      default:
        return '';
    }
  }
}
