import { CommonModule, Location } from '@angular/common';
import { BraAlert } from '../../shared/alert/alert';
import { Component, Optional, QueryList, ViewChildren } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { InputAcesso } from '../input-acesso/input-acesso';

@Component({
  selector: 'bra-login',
  imports: [FormsModule, InputAcesso, CustomButton, RouterModule, CommonModule, BraAlert],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  senha = '';
  erro = '';

  @ViewChildren(InputAcesso) inputsAcesso!: QueryList<InputAcesso>;

  constructor(
    private router: Router,
    private auth: AuthService,
    private route: ActivatedRoute,
    private authService: AuthService,
    @Optional() private location: Location,
  ) {}

  entrar() {
    this.erro = '';

    this.inputsAcesso.forEach((input) => input.markAsTouched());

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
    if (!this.email.trim() || !emailValido || !this.senha) {
      return;
    }

    const returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '/home';

    this.authService.login(this.email, this.senha).subscribe(
      (res: any) => {
        if (res.success) {
          // Salva o objeto completo retornado pelo backend (inclui is_admin)
          const userData = res.user ?? { id: res.id, email: this.email };
          this.auth.saveUserSession(userData, res.token);
          this.router.navigateByUrl(returnUrl);
        } else {
          this.erro = res.message || 'Erro no login.';
        }
      },
      (err) => {
        // A API responde 401 (credenciais) e 429 (muitas tentativas) com a mensagem pronta
        this.erro =
          err.error?.message ||
          err.error?.mensagem ||
          'Erro ao conectar com o servidor.';
      },
    );
  }

  irParaRecuperacao() {
    this.router.navigate(['/recuperar-senha']);
  }

  voltar() {
    if (this.location && window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/home']);
    }
  }
}
