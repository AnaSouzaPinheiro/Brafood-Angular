import { Component } from '@angular/core';

@Component({
  selector: 'bra-credit',
  imports: [],
  templateUrl: './credit.html',
  styleUrl: './credit.scss'
})
export class Credit {
  /** Ano atual, para o copyright não ficar desatualizado. */
  readonly ano = new Date().getFullYear();
}
