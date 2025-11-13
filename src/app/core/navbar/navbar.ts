import { Component, HostListener, signal } from '@angular/core';
import { ModalLog } from '../modal-log/modal-log';
import { SearchBar } from '../search-bar/search-bar';
import { UserIcon } from '../user-icon/user-icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { User } from '../../model/user';
import { MyRecipesService } from '../../services/my-recipes';

@Component({
  selector: 'bra-navbar',
  standalone: true,
  imports: [ModalLog, SearchBar, UserIcon, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar {
  isLoggedIn = signal(true);
  openModal = signal(false);

  /*modalLogged = {
    personName: 'Ana Letícia',

    myAccount: '/editar-perfil',
    myRecipes: '/minhas-receitas',
    favs: '',
  };*/

  get modalData() {
    return {
      personName: `${this.user?.nome || ''} ${
        this.user?.sobrenome || ''
      }`.trim(),
      myAccount: '/editar-perfil',
      myRecipes: this.user?.id
        ? `/minhas-receitas/${this.user.id}`
        : '/minhas-receitas',
      favs: '/favoritos',
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
      !target.closest('.icon-modal')
    ) {
      this.openModal.set(false);
    }
  }

  user!: User;

  constructor(
    private route: ActivatedRoute,
    private myRecipesServices: MyRecipesService
  ) {}

  ngOnInit() {
    // Captura o parâmetro "id" da rota atual
    // const idParam = this.route.snapshot.paramMap.get('id');
    const idParam = 1;

    if (idParam) {
      // const id = Number(idParam);
      const id = 1;

      this.myRecipesServices.buscarUserPorId(id).subscribe((s: any) => {
        this.user = {
          id: id,
          nome: s.nome,
          sobrenome: s.sobrenome,
          apelido: s.apelido,
          email: s.email,
          genero: s.genero,
          bio: s.bio,
          foto_perfil: s.foto_perfil,
        };
      });
    }
  }
}
