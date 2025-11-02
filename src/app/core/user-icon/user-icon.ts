import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'bra-user-icon',
  standalone: true,
  template: `
    <img
      class="icon icon-modal"
      [src]="photoUrl ? photoUrl : defaultIcon"
      alt="Foto do usuário"
      (click)="iconClicked($event)"
    />
  `,
  styleUrl: './user-icon.scss',
})
export class UserIcon {
  @Input() photoUrl?: string;
  @Output() clickIcon = new EventEmitter<Event>();

  defaultIcon = 'assets/imagens/icones/pessoas.png';

  iconClicked(event: Event): void {
    this.clickIcon.emit(event);
  }
}
