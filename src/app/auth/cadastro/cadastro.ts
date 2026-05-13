import { Component } from '@angular/core';
import { InputAcesso } from '../input-acesso/input-acesso';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';

@Component({
  selector: 'bra-cadastro',
  imports: [FormsModule, InputAcesso, CustomButton, RouterModule],
  templateUrl: './cadastro.html',
  styleUrl: './cadastro.scss',
})
export class Cadastro {
  nome = '';
  email = '';
  senha = '';
  confirmarSenha = '';
  erros: string[] = [];

  constructor(
    private router: Router,
    private auth: AuthService,
    private location: Location,
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  cadastrar() {
    this.erros = [];

    const senhaOk = this.validarSenhaFront();

    if (!senhaOk) return;

    const returnUrl =
      this.route.snapshot.queryParamMap.get('returnUrl') || '/home';

    this.authService
      .cadastro(this.nome, this.email, this.senha, this.confirmarSenha)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.router.navigate(['/login'], {
              queryParams: {
                returnUrl,
              },
            });
          } else {
            res.errors?.forEach((erro: string, indice: number) => {
              const cor = erro ? 'red' : 'green';
              this.mudarCorErro(indice, cor);
            });
          }
        },
        () => {
          this.erros = ['Erro ao conectar com o servidor.'];
        },
      );
  }

  voltar() {
    // Se houver histórico real no navegador
    if (window.history.length > 1) {
      this.location.back();
    } else {
      // Se o usuário entrou direto na URL
      this.router.navigate(['/home']);
    }
  }

  mudarCorErro(indice: number, cor: string) {
    const li = document.getElementById('r' + indice);
    if (li) {
      li.style.color = cor;
    }
  }

  validarSenhaFront() {
    const regras = [
      this.senha.length >= 8,
      /[0-9]/.test(this.senha),
      /[a-z]/.test(this.senha),
      /[A-Z]/.test(this.senha),
      /[!@#$.?&()+-]/.test(this.senha),
    ];

    regras.forEach((valido, i) => {
      this.mudarCorErro(i, valido ? 'green' : 'red');
    });

    // Retorna true se todas regras estiverem ok
    return regras.every((r) => r);
  }
}
