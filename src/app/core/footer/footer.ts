import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Categoria } from '../../model/categoria';
import { CategoriaService } from '../../services/categoria';
import { Auth } from '../../services/auth';

@Component({
  selector: 'bra-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  logado = false;
  userId: string | null = null;
  categorias: Categoria[] = [];

  constructor(
    public auth: Auth,
    private categoriaServices: CategoriaService
  ) {}

  ngOnInit() {
    this.logado = this.auth.isLoggedIn();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.userId = user?.id ?? null;

    this.categoriaServices.listCats().subscribe((categorias) => {
      this.categorias = categorias.map((c: any) => ({
        id: c.id,
        nome: c.nome,
        icon: c.icone,
        fundo: '',
        cssClass: c.css_class,
        url: `/categoria/${c.id}/${c.nome}`,
        subcategorias: c.subcategorias ?? [],
      }));
    });
  }

  logout() {
    this.auth.logout();
    location.reload();
  }
}
