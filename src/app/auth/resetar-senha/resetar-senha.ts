import { Component } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { InputAcesso } from '../input-acesso/input-acesso';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { MyRecipesService } from '../../services/my-recipes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-resetar-senha',
  standalone: true,
  imports: [FormsModule, RouterModule, InputAcesso, CustomButton, CommonModule],
  templateUrl: './resetar-senha.html',
  styleUrl: './resetar-senha.scss',
})
export class ResetarSenha {
  senha = '';
  confirmarSenha = '';
  mensagem = '';
  sucesso = false;
  token = '';

  constructor(
    private route: ActivatedRoute,
    private service: MyRecipesService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.params['token'];

    if (!this.token) {
      this.mensagem = 'Token inválido.';
    }
  }

  voltar() {
    this.router.navigate(['/login']);
  }

  resetar() {
    this.mensagem = '';
    this.sucesso = false;

    if (!this.senha || !this.confirmarSenha) {
      this.mensagem = 'Preencha todos os campos.';
      return;
    }

    if (this.senha !== this.confirmarSenha) {
      this.mensagem = 'As senhas não coincidem.';
      return;
    }

    this.service
      .resetarSenha(this.token, this.senha, this.confirmarSenha)
      .subscribe(
        (res: any) => {
          this.mensagem = res.message || 'Senha redefinida com sucesso!';

          if (res.success) {
            this.sucesso = true;
            setTimeout(() => this.router.navigate(['/login']), 2000);
          }
        },
        () => {
          this.mensagem = 'Erro ao conectar com o servidor.';
        },
      );
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
