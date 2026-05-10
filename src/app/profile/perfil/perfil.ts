import { Component, signal } from '@angular/core';
import { UserIcon } from '../../core/user-icon/user-icon';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../model/user';
import { AuthService } from '../../services/auth/auth.service';
import { UsuarioService } from '../../services/usuario/usuario.service';

@Component({
  selector: 'bra-perfil',
  imports: [UserIcon, CustomButton, RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  logado = false;
  userId: string | null = null;
  user = signal<User | undefined>(undefined);

  constructor(
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.logado = this.auth.isLoggedIn();

    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user');
      if (userData) {
        this.userId = JSON.parse(userData).id;
      }
    }

    if (this.userId) {
      this.usuarioService
        .buscarUserPorId(Number(this.userId))
        .subscribe((s: any) => {
          this.user.set({
            id: Number(s.id),
            nome: s.nome,
            sobrenome: s.sobrenome,
            apelido: s.apelido,
            email: s.email,
            genero: s.genero,
            bio: s.bio,
            foto_perfil: s.foto_perfil,
          });
        });
    }
  }

  get isEditarPerfil() {
    return this.router.url === `/editar-perfil/${this.userId}`;
  }

  get isMinhasReceitas() {
    return this.router.url === `/minhas-receitas/${this.userId}`;
  }
}
