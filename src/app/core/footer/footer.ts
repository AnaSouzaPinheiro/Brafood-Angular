import { Component } from '@angular/core';
import { MyRecipesService } from '../../services/my-recipes';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Categoria } from '../../model/categoria';
import { CategoriaService } from '../../services/categoria';

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
    public service: MyRecipesService,
    private route: ActivatedRoute,
    private categoriaServices: CategoriaService
  ) {}

  ngOnInit() {
    this.logado = this.service.isLoggedIn();
    this.userId = localStorage.getItem('userId');

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
    localStorage.removeItem('userId');
    this.logado = false;
    location.reload(); // limpa visual e navbar
  }
}
