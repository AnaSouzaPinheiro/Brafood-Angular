import { Component, input, signal, OnInit } from '@angular/core';

export type InputType = 'email' | 'senha' | 'nome' | 'confirmarSenha';

@Component({
  selector: 'bra-input-acesso',
  standalone: true,
  imports: [],
  templateUrl: './input-acesso.html',
  styleUrl: './input-acesso.scss',
})
export class InputAcesso implements OnInit {
  type = input<InputType>('email');

  placeholder = signal('');
  icon = signal('');

  ngOnInit() {
    switch (this.type()) {
      case 'email':
        this.placeholder.set('E-mail');
        this.icon.set('assets/imagens/icones/o-email.png');
        break;
      case 'senha':
        this.placeholder.set('Senha');
        this.icon.set('assets/imagens/icones/trancar.png');
        break;
      case 'nome':
        this.placeholder.set('Nome');
        this.icon.set('assets/imagens/icones/do-utilizador.png');
        break;
      case 'confirmarSenha':
        this.placeholder.set('Confirme sua senha');
        this.icon.set('assets/imagens/icones/trancar.png');
        break;
    }
  }

  getClasses() {
    return {
      [this.type()]: true,
    };
  }
}
