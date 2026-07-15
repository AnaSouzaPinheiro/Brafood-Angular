import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserIcon } from '../../core/user-icon/user-icon';
import { User } from '../../model/user';
import { AuthService } from '../../services/auth/auth.service';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { ProfileHeaderSkeleton } from '../../shared/profile-header-skeleton/profile-header-skeleton';

@Component({
  selector: 'bra-perfil',
  imports: [UserIcon, CustomButton, RouterModule, CommonModule, ProfileHeaderSkeleton],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  logado = false;
  userId: string | null = null;
  user = signal<User | undefined>(undefined);
  loadingUser = true;

  constructor(
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private router: Router,
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
        .subscribe({
          next: (response) => {
            const usuario = response.usuario;

            this.user.set({
              id: Number(usuario.id),
              nome: usuario.nome,
              sobrenome: usuario.sobrenome,
              apelido: usuario.apelido,
              email: usuario.email,
              genero: usuario.genero,
              bio: usuario.bio,
              foto_perfil: usuario.foto_perfil,
            });
            this.loadingUser = false;
          },
          error: () => {
            this.loadingUser = false;
          },
        });
    } else {
      this.loadingUser = false;
    }
  }

  get isEditarPerfil() {
    return this.router.url === `/editar-perfil/${this.userId}`;
  }

  get isMinhasReceitas() {
    return this.router.url === `/minhas-receitas/${this.userId}`;
  }

  get isFavoritas() {
    return this.router.url === `/favoritas/${this.userId}`;
  }
}