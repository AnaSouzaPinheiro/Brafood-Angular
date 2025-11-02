import { Component } from '@angular/core';
import { UserIcon } from "../../core/user-icon/user-icon";
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'bra-perfil',
  imports: [UserIcon, CustomButton, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss'
})
export class Perfil {
  person = {
    photoUrl: 'assets/imagens/icones/pessoas.png',
    name: 'Ana Letícia',
    text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
  };
}
