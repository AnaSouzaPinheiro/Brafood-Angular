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
          ordem: c.ordem,
          cor_primaria: c.cor_primaria,
          gradiente_hover: c.gradiente_hover,
          url: `/categoria/${toSlug(c.nome)}/${c.id}`,
          subcategorias: c.subcategorias ?? [],
        }));
    });
  }

  onHover(event: MouseEvent, categoria: Categoria) {
    if (categoria.gradiente_hover) {
      (event.currentTarget as HTMLElement).style.background = categoria.gradiente_hover;
    }
  }

  onLeave(event: MouseEvent, categoria: Categoria) {
    const el = event.currentTarget as HTMLElement;
    el.style.background = '';
    if (categoria.cor_primaria) {
      el.style.backgroundColor = categoria.cor_primaria;
    }
  }
}
