import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Categoria } from '../../model/categoria';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { AuthService } from '../../services/auth/auth.service';
import { toSlug } from '../../utils/slug';

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
    public auth: AuthService,
    private categoriaServices: CategoriaService
  ) {}

  ngOnInit() {
    this.logado = this.auth.isLoggedIn();

    const user = JSON.parse(localStorage.getItem('user') || 'null');
    this.userId = user?.id ?? null;

    this.categoriaServices.listCats().subscribe((categorias) => {
      this.categorias = categorias.map((c: Categoria) => ({
        id: c.id,
        nome: c.nome,
        icone: c.icone,
        fundo: '',
        css_class: c.css_class,
        url: `/categoria/${toSlug(c.nome)}/${c.id}`,
        subcategorias: c.subcategorias ?? [],
      }));
    });
  }

  logout() {
    this.auth.logout();
    location.reload();
  }
}
