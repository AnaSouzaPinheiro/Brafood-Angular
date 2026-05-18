import { Component, computed, HostListener, signal, WritableSignal } from '@angular/core';
import { ModalLog } from '../modal-log/modal-log';
import { SearchBar } from '../search-bar/search-bar';
import { UserIcon } from '../user-icon/user-icon';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../model/user';
import { UsuarioService } from '../../services/usuario/usuario.service';

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
  }

  ngOnInit() {
    if (this.auth.isLoggedIn()) {
      const currentUser = this.auth.user();
      if (currentUser?.id) {
        // Atualiza com dados frescos do servidor em background
        this.usuarioService
          .buscarUserPorId(currentUser.id)
          .subscribe((response) => {
            const user = response.usuario;
            this.user.set(user);
            this.buildModalData(user);
          });
      }
    }
  }

  private buildModalData(u: any) {
    this.modalData = {
      personName: `${u?.nome || ''} ${u?.sobrenome || ''}`.trim(),
      myAccount:  u?.id ? `/editar-perfil/${u.id}` : '/editar-perfil',
      myRecipes:  u?.id ? `/minhas-receitas/${u.id}` : '/minhas-receitas',
      favs:       u?.id ? `/favoritas/${u.id}` : '/favoritas',
      // adminLink só aparece se is_admin === 1 (campo vindo do banco)
      adminLink:  u?.is_admin === 1 ? '/admin' : undefined,
    };
  }

  togglePopup(event: Event) {
    event.stopPropagation();
    this.openModal.set(!this.openModal());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    if (
      this.openModal() &&
      !target.closest('.profile-container') &&
      !target.closest('.icon-area')
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

