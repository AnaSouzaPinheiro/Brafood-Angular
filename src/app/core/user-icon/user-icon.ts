import { Component, EventEmitter, Input, Output, Signal } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../model/user';

@Component({
  selector: 'bra-user-icon',
  standalone: true,
  templateUrl: './user-icon.html',
  styleUrl: './user-icon.scss',
})
export class UserIcon {
  @Output() clickIcon = new EventEmitter<Event>();
  @Input() user?: Partial<User>; // opcional
  @Input() userSignal?: Signal<User | undefined>; // opcional

  defaultIcon = 'assets/imagens/icones/pessoas.png';

  constructor(private auth: AuthService) {
    // Se quiser inicializar com o usuário do AuthService, você pode:
    this.auth.loadFromStorage();
    if (!this.userSignal) {
      this.userSignal = this.auth.user; // pega o usuário logado
    }
  }

  iconClicked(event: Event) {
    this.clickIcon.emit(event);
  }

  get mappedUser() {
    const u = this.user || this.userSignal?.();

    return {
      id: u?.id ?? 0,
      nome: u?.nome ?? '',
      sobrenome: u?.sobrenome ?? '',
      apelido: u?.apelido ?? '',
      email: u?.email ?? '',
      genero: u?.genero ?? '',
      bio: u?.bio ?? '',
      foto_perfil: u?.foto_perfil || this.defaultIcon,
    };
  }
}
