import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'bra-search-bar',
  imports: [FormsModule, RouterModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  termo: string = '';

  constructor(private router: Router) {}

  buscar() {
    const texto = this.termo.trim();
    if (texto.length > 0) {

      //console.log(texto);
      this.router.navigate(['/pesquisa', texto]);
    }
  }
}
