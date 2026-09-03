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

    const usuarioLogado = this.auth.user();
    if (usuarioLogado) {
      this.userId = usuarioLogado.id;
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
    return this.pathStartsWith('/editar-perfil');
  }

  get isMinhasReceitas() {
    // "Minhas receitas" também deve ficar ativo nas páginas de criar/editar
    // receita, já que o usuário chega nelas a partir dessa seção.
    return (
      this.pathStartsWith('/minhas-receitas') ||
      this.pathStartsWith('/editar-receita') ||
      this.pathStartsWith('/adicionar-receita')
    );
  }

  get isFavoritas() {
    return this.pathStartsWith('/favoritas');
  }

  // Compara só o caminho (ignora query string/fragment) e usa prefixo em vez
  // de igualdade exata, pra cobrir sub-rotas e futuros query params.
  private pathStartsWith(prefix: string): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];
    return path === prefix || path.startsWith(`${prefix}/`);
  }
}