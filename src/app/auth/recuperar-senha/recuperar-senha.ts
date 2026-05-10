import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputAcesso } from '../input-acesso/input-acesso';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { AuthService } from '../../services/auth/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-recuperar-senha',
  standalone: true,
  imports: [FormsModule, RouterModule, InputAcesso, CustomButton, CommonModule],
  templateUrl: './recuperar-senha.html',
  styleUrl: './recuperar-senha.scss',
})
export class RecuperarSenha {
  email = '';
  erro = '';
  sucesso = '';

  constructor(private auth: AuthService, private router: Router) {}

  voltar() {
    this.router.navigate(['/login']);
  }

  enviar() {
    this.erro = '';
    this.sucesso = '';

    if (!this.email.trim()) {
      this.erro = 'Digite seu e-mail.';
      return;
    }

    this.auth.solicitarRecuperacao(this.email).subscribe(
      (res: any) => {
        if (res.success) {
          this.sucesso = res.message || 'Enviamos um link para seu e-mail!';
        } else {
          this.erro = res.message || 'Não foi possível enviar o e-mail.';
        }
      },
      () => {
        this.erro = 'Erro ao conectar com o servidor.';
      }
    );
  }
}
