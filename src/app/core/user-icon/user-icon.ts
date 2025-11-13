import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'bra-user-icon',
  standalone: true,
  template: `
    <img
      class="icon icon-modal"
      [src]="mappedUser.foto_perfil || defaultIcon"
      alt="Foto do usuário"
      (click)="iconClicked($event)"
    />
  `,
  styleUrl: './user-icon.scss',
})
export class UserIcon {
  @Input() user: any = {}; // evita erro se não for passado
  @Output() clickIcon = new EventEmitter<Event>();

  defaultIcon = 'assets/imagens/icones/pessoas.png';

  get mappedUser() {
    // usa optional chaining (?.) e fallback pra evitar erros
    return {
      id: this.user?.id || 0,
      nome: this.user?.nome || '',
      sobrenome: this.user?.sobrenome || '',
      apelido: this.user?.apelido || '',
      email: this.user?.email || '',
      genero: this.user?.genero || '',
      bio: this.user?.bio || '',
      foto_perfil: this.user?.foto_perfil || '',
    };
  }

  iconClicked(event: Event): void {
    this.clickIcon.emit(event);
  }
}
