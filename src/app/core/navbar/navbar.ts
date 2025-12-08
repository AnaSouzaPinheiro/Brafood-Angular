import { Component, HostListener, signal } from '@angular/core';
import { ModalLog } from '../modal-log/modal-log';
import { SearchBar } from '../search-bar/search-bar';
import { UserIcon } from '../user-icon/user-icon';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { MyRecipesService } from '../../services/my-recipes';
import { Auth } from '../../services/auth';

@Component({
  selector: 'bra-navbar',
  standalone: true,
  imports: [ModalLog, SearchBar, UserIcon, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  isLoggedIn = signal(false);
  openModal = signal(false);
  user: any;

  modalData: any = null;

  constructor(
    private route: ActivatedRoute,
    private myRecipesServices: MyRecipesService,
    private auth: Auth,
    private router: Router
  ) {
    // aqui auth já foi inicializado
    this.user = this.auth.user;
  }

  ngOnInit() {
    this.auth.loadFromStorage();
    this.isLoggedIn.set(this.auth.isLoggedIn());

    if (this.isLoggedIn()) {
      const currentUser = this.user();

      if (currentUser?.id) {
        this.myRecipesServices
          .buscarUserPorId(currentUser.id)
          .subscribe((s: any) => {
            // atualiza o signal corretamente
            this.user.set({
              id: currentUser.id,
              nome: s.nome,
              sobrenome: s.sobrenome,
              apelido: s.apelido,
              email: s.email,
              genero: s.genero,
              bio: s.bio,
              foto_perfil: s.foto_perfil,
            });

            const u = this.user();

            // monta os dados do modal corretamente
            this.modalData = {
              personName: `${u?.nome || ''} ${u?.sobrenome || ''}`.trim(),
              myAccount: '/editar-perfil',
              myRecipes: u?.id
                ? `/minhas-receitas/${u.id}`
                : '/minhas-receitas',
              favs: '/favoritos',
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
    this.isLoggedIn.set(false);
    this.router.navigate(['/login']);
  }
}
