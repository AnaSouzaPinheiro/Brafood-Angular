import { Component, HostListener, signal } from '@angular/core';
import { ModalLog } from '../modal-log/modal-log';
import { SearchBar } from '../search-bar/search-bar';
import { UserIcon } from '../user-icon/user-icon';
import { RouterModule } from '@angular/router';

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

  modalLogged = {
    personName: 'Ana Letícia',
    
    myAccount: '/editar-perfil',
    myRecipes: '/minhas-receitas',
    favs: ''
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
}
