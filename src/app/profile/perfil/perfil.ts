import { Component, computed } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

/**
 * Abas de navegação das telas internas do perfil
 * (Editar perfil, Minhas receitas, Favoritas).
 * A aba da página aberta é destacada via routerLinkActive.
 */
@Component({
  selector: 'bra-perfil',
  imports: [RouterModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.scss',
})
export class Perfil {
  logado = computed(() => !!this.auth.user());
  apelido = computed(() => this.auth.user()?.apelido ?? null);

  constructor(private auth: AuthService) {}
}
