import { Component, Optional } from '@angular/core';
import { InputAcesso } from '../input-acesso/input-acesso';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'bra-login',
  imports: [FormsModule, InputAcesso, CustomButton, RouterModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  senha = '';
  erro = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    @Optional() private location: Location,
    private auth: AuthService
  ) {}

  entrar() {
    this.erro = '';
    this.authService.login(this.email, this.senha).subscribe(
      (res: any) => {
        if (res.success) {
          // Salva no AuthService e localStorage
          this.auth.saveUserSession({ id: res.id, email: this.email });

          // Redireciona
          this.router.navigate(['/home']);
        } else {
          this.erro = res.message || 'Erro no login.';
        }
      },
      (err) => {
        this.erro = err.error?.message || 'Erro ao conectar com o servidor.';
      }
    );
  }

  irParaRecuperacao() {
    this.router.navigate(['/recuperar-senha']);
  }

  voltar() {
    // Se houver histórico real no navegador
    if (this.location && window.history.length > 1) {
      this.location.back();
    } else {
      // Se o usuário entrou direto na URL
      this.router.navigate(['/home']);
    }
  }
}
