import { Component, HostListener, signal, WritableSignal } from '@angular/core';
import { ModalLog } from '../modal-log/modal-log';
import { SearchBar } from '../search-bar/search-bar';
import { UserIcon } from '../user-icon/user-icon';
import { Router, RouterModule } from '@angular/router';
import { MyRecipesService } from '../../services/my-recipes';
import { Auth } from '../../services/auth';
import { User } from '../../model/user';

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
  user: WritableSignal<User | undefined>; // 🔹 corrigido para WritableSignal

  modalData: any = null;

  constructor(
    private myRecipesServices: MyRecipesService,
    private auth: Auth,
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
        this.myRecipesServices
          .buscarUserPorId(currentUser.id)
          .subscribe((s: any) => {
            this.user.set({
              // agora funciona
              id: s.id,
              nome: s.nome,
              sobrenome: s.sobrenome,
              apelido: s.apelido,
              email: s.email,
              genero: s.genero,
              bio: s.bio,
              foto_perfil: s.foto_perfil,
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
      !target.closest('.icon-modal')
    ) {
      this.openModal.set(false);
    }
  }

  logout() {
    this.auth.logout();
    this.logado = false;
    this.user.set(undefined); // 🔹 agora funciona
    this.router.navigate(['/login']);
  }

  atualizarUser(novoUser: User) {
    this.user.set(novoUser); // funciona porque é WritableSignal
  }
}
