import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Categoria } from '../../model/categoria';
import { CategoriaService } from '../../services/categoria/categoria.service';
import { toSlug } from '../../utils/slug';

@Component({
  selector: 'bra-category-bar',
  standalone: true,
  templateUrl: './category-bar.html',
  styleUrls: ['./category-bar.scss'],
  imports: [CommonModule, RouterModule],
})
export class CategoryBar {
  categorias: Categoria[] = [];

  constructor(
    private route: ActivatedRoute,
    private categoriaServices: CategoriaService,
  ) {}

  ngOnInit() {
    this.categoriaServices.listCats().subscribe((categorias) => {
      this.categorias = categorias
        .filter((c: Categoria) => c.subcategorias?.length > 0)
        .map((c: Categoria) => ({
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
}
