import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { Auth } from '../../services/auth';
import { User } from '../../model/user';

@Component({
  selector: 'bra-user-icon',
  standalone: true,
  templateUrl: './user-icon.html',
  styleUrl: './user-icon.scss',
})
export class UserIcon {
  @Output() clickIcon = new EventEmitter<Event>();
  @Input() user?: User; // opcional
  @Input() userSignal?: Signal<User | undefined>; // opcional

  defaultIcon = 'assets/imagens/icones/pessoas.png';

  constructor(private auth: Auth) {
    // Se quiser inicializar com o usuário do Auth, você pode:
    this.auth.loadFromStorage();
    if (!this.userSignal) {
      this.userSignal = this.auth.user; // pega o usuário logado
    }
  }

  iconClicked(event: Event) {
    this.clickIcon.emit(event);
  }

  get mappedUser() {
    const u: User | undefined = this.userSignal?.() || this.user;
    return {
      id: u?.id || 0,
      nome: u?.nome || '',
      sobrenome: u?.sobrenome || '',
      apelido: u?.apelido || '',
      email: u?.email || '',
      genero: u?.genero || '',
      bio: u?.bio || '',
      foto_perfil: u?.foto_perfil || this.defaultIcon,
    };
  }
}
