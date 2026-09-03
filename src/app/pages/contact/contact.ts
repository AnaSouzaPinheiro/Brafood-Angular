import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { EnviaEmailService } from '../../services/envia-email/envia-email.service';
import { ModalService } from '../../services/modal/modal.service';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { BraInput } from '../../shared/input/input';

@Component({
  selector: 'bra-contact',
  standalone: true,
  imports: [BraInput, ReactiveFormsModule, CustomButton],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  form: FormGroup;
  tentouEnviar = false;

  constructor(
    private fb: FormBuilder,
    private modalService: ModalService,
    private enviaEmailService: EnviaEmailService,
  ) {
    this.form = this.fb.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      assunto: [
        '',
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(100),
        ],
      ],
      mensagem: [
        '',
        [
          Validators.required,
          Validators.minLength(20),
          Validators.maxLength(255),
        ],
      ],
    });
  }

  enviar() {
    this.tentouEnviar = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      const primeiroErro = document.querySelector(
        '.input-error, .imagem-error, .field-error',
      );
      primeiroErro?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const emailMsg = this.form.value;

    this.enviaEmailService.enviarEmail(emailMsg).subscribe({
      next: (res) => {
        if (res?.success) {
          this.form.reset();
          this.tentouEnviar = false;
          this.modalService.open({
            type: 'success',
            title: 'E-mail enviado!',
            message: '',
            confirmText: 'OK',
          });
          return;
        } else {
          this.modalService.open({
            type: 'error',
            title: 'Erro',
            message:
              res?.mensagem ||
              'Erro ao enviar e-mail. Tente novamente mais tarde.',
          });
        }
      },
      error: (err) => {
        this.modalService.open({
          type: 'error',
          title: 'Erro',
          message:
            err?.mensagem ||
            'Erro ao enviar e-mail. Tente novamente mais tarde.',
        });
      },
      
    });
  }
}
