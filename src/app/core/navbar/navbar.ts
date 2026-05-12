import { Component, HostListener, signal, WritableSignal } from '@angular/core';
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
  logado = false;
  userId: string | null = null;
  user: WritableSignal<User | undefined>;

  modalData: any = null;

  constructor(
    private usuarioService: UsuarioService,
    private auth: AuthService,
    private router: Router
  ) {
    this.auth.loadFromStorage();
    this.user = signal<User | undefined>(this.auth.user());
  }

  ngOnInit() {
    this.logado = this.auth.isLoggedIn();

    const userData = localStorage.getItem('user');
    if (userData) {
      this.userId = JSON.parse(userData).id;
    }

    if (this.auth.isLoggedIn()) {
      const currentUser = this.auth.user();
      if (currentUser?.id) {
        this.usuarioService
          .buscarUserPorId(currentUser.id)
          .subscribe((response) => {
            const user = response.usuario;
            this.user.set({
              id: user.id,
              nome: user.nome,
              sobrenome: user.sobrenome,
              apelido: user.apelido,
              email: user.email,
              genero: user.genero,
              bio: user.bio,
              foto_perfil: user.foto_perfil,
            });

            const u = this.user();
            this.modalData = {
              personName: `${u?.nome || ''} ${u?.sobrenome || ''}`.trim(),
              myAccount: u?.id
                ? `/editar-perfil/${u.id}`
                : '/editar-perfil',
              myRecipes: u?.id
                ? `/minhas-receitas/${u.id}`
                : '/minhas-receitas',
              favs: u?.id
                ? `/favoritas/${u.id}`
                : '/favoritas',
            };
          });
      }
    }
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
    this.logado = false;
    this.user.set(undefined);
    this.router.navigate(['/login']);
  }

  atualizarUser(novoUser: User) {
    this.user.set(novoUser);
  }
}
