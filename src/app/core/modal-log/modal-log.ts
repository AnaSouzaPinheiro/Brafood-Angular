import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'bra-modal-log',
  standalone: true,
  imports: [ RouterModule ],
  templateUrl: './modal-log.html',
  styleUrl: './modal-log.scss',
})
export class ModalLog {
  @Input() loggedOut: boolean = false;

  @Input() modalLogged!: {
    personName: string;

    myAccount: string;
    myRecipes: string;
    favs: string;
  };
}
