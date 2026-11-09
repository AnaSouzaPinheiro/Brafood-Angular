import { Component, computed, effect, HostListener, signal, WritableSignal } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { User } from '../../model/user';
import { AuthService } from '../../services/auth/auth.service';
import { UsuarioService } from '../../services/usuario/usuario.service';
import { ModalLog } from '../modal-log/modal-log';
import { SearchBar } from '../search-bar/search-bar';
import { UserIcon } from '../user-icon/user-icon';

@Component({
  selector: 'bra-navbar',
  standalone: true,
  imports: [ModalLog, SearchBar, UserIcon, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  openModal = signal(false);
  user: WritableSignal<User | undefined>;
  modalData: any = null;

  // computed garante reatividade automática — atualiza quando o signal muda
  logado = computed(() => this.auth.isLoggedIn());

  /** Nome exibido ao lado do ícone (desktop): apelido, senão primeiro nome */
  displayName = computed(() => {
    // auth.user() é atualizado na hora ao editar o perfil
    const u = { ...this.user(), ...(this.auth.user() ?? {}) };
    if (!this.logado() || !u.nome) return 'Entrar';
    return u.apelido?.trim() || u.nome?.trim().split(' ')[0] || 'Minha conta';
  });

  constructor(
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.loadFromStorage();
    // Monta o signal com o que já existe no storage
    const storedUser = this.auth.getUser();
    this.user = signal<User | undefined>(storedUser ?? undefined);
    // Monta modalData imediatamente com dados do storage (sem HTTP)
    if (storedUser) {
      this.buildModalData(storedUser);
    }

    // Mantém o ícone sincronizado com o AuthService: se a sessão for encerrada
    // em qualquer lugar (expirou, logout em outra aba, erro 401 etc.), o
    // sinal local do Navbar acompanha em vez de ficar com a foto travada.
    // Fecha o menu sempre que o usuário navega para outra página
    // (clicou em "Minhas receitas", "Sair", etc.)
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationStart),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.openModal.set(false));

    effect(() => {
      if (!this.auth.isLoggedIn()) {
        this.user.set(undefined);
        this.modalData = null;
      }
    });
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      const currentUser = this.auth.user();
      if (currentUser?.id) {
        // Atualiza com dados frescos do servidor em background
        this.usuarioService
          .buscarUserPorId(currentUser.id)
          .subscribe({
            next: (response) => {
              const user = response.usuario;
              this.user.set(user);
              this.buildModalData(user);
            },
            error: (err) => {
              // Sessão expirada/token inválido no servidor: desloga de fato
              // pra limpar storage e sincronizar todo o app (não só o ícone).
              if (err.status === 401 || err.status === 403) {
                this.auth.logout();
                this.user.set(undefined);
                this.modalData = null;
              }
            },
          });
      }
    }
  }

  private buildModalData(u: any) {
    this.modalData = {
      personName: u?.nome || '',
      myAccount:  '/perfil/editar',
      myRecipes:  '/perfil/receitas',
      favs:       '/perfil/favoritas',
      // adminLink só aparece se is_admin === 1 (campo vindo do banco)
      adminLink:  u?.is_admin === 1 ? '/admin' : undefined,
    };
  }

  togglePopup(event: Event) {
    event.stopPropagation();
    this.openModal.set(!this.openModal());
  }

  /** Clicou numa opção do menu (inclusive a página já aberta): fecha */
  onMenuClick(event: Event) {
    if ((event.target as HTMLElement).closest('a, li[routerLink], .logOut, .enter, .register')) {
      this.openModal.set(false);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (
      this.openModal() &&
      !target.closest('.profile-container') &&
      !target.closest('.user-area')
    ) {
      this.openModal.set(false);
    }
  }

  logout() {
    this.auth.logout();
    this.user.set(undefined);
    this.router.navigate(['/login']);
  }

  atualizarUser(novoUser: User) {
    this.user.set(novoUser);
  }
}

