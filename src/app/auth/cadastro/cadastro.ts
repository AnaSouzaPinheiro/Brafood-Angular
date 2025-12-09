import { Component } from '@angular/core';
import { InputAcesso } from '../input-acesso/input-acesso';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Router, RouterModule } from '@angular/router';
import { MyRecipesService } from '../../services/my-recipes';
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
    private service: MyRecipesService,
    private router: Router,
    private location: Location
  ) {}

  cadastrar() {
    this.erros = [];

    // Validação front antes de enviar
    const senhaOk = this.validarSenhaFront();

    if (!senhaOk) {
      // Não envia se a senha estiver errada
      return;
    }

    this.service
      .cadastro(this.nome, this.email, this.senha, this.confirmarSenha)
      .subscribe(
        (res: any) => {
          if (res.success) {
            this.router.navigate(['/login']);
          } else {
            // Atualiza cores novamente caso o back encontre algo
            res.errors?.forEach((erro: string, indice: number) => {
              const cor = erro ? 'red' : 'green';
              this.mudarCorErro(indice, cor);
            });
          }
        },
        (err) => {
          this.erros = ['Erro ao conectar com o servidor.'];
        }
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
