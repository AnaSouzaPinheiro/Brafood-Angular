import { Component, Input, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-modal-log',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './modal-log.html',
  styleUrl: './modal-log.scss',
})
export class ModalLog {
  @Input() loggedOut = false;
  @Input() modalLogged!: {
    personName: string;
    myAccount: string;
    myRecipes: string;
    favs: string;
  };

  @Input() logout!: () => void; // recebe função de logout do Navbar
}
