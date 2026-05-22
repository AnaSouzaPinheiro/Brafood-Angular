import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { PerfilPublicoService, PerfilPublico } from '../../services/perfil-publico/perfil-publico.service';
import { toSlug } from '../../utils/slug';

@Component({
  selector: 'bra-perfil-publico',
  standalone: true,
  imports: [CommonModule, RouterModule, RecipeCard, MediaUrlPipe],
  templateUrl: './perfil-publico.html',
  styleUrl: './perfil-publico.scss',
})
export class PerfilPublicoPage {
  perfil = signal<PerfilPublico | null>(null);
  carregando = true;
  erro = false;

  constructor(
    private route: ActivatedRoute,
    private perfilService: PerfilPublicoService,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.erro = true;
      this.carregando = false;
      return;
    }

    this.perfilService.buscar(id).subscribe({
      next: (data) => {
        this.perfil.set(data);
        this.carregando = false;
      },
      error: () => {
        this.erro = true;
        this.carregando = false;
      },
    });
  }

  /** Converte receita raw da API no shape que o recipe-card espera */
  mapReceita(r: any) {
    return {
      id:              r.id,
      category:        r.categoria ?? '',
      img:             r.imagem1 ?? '',
      url:             `/receita/${toSlug(r.titulo)}/${r.id}`,
      categoria:       r.categoria,
      subcategoria:    r.subcategoria ?? null,
      subcategorias:   r.subcategorias ?? [],
      imagem1:         r.imagem1,
      titulo:          r.titulo,
      qtd_fav:         r.qtd_fav,
      media_avaliacao: r.media_avaliacao,
      qtd_avaliacoes:  r.qtd_avaliacoes,
      resumo:          r.resumo,
      resume: {
        title:  r.titulo,
        qtdFav: Number(r.qtd_fav ?? 0),
        text:   r.resumo ?? '',
      },
    };
  }

  get nomeCompleto(): string {
    const u = this.perfil()?.usuario;
    if (!u) return '';
    return [u.nome, u.sobrenome].filter(Boolean).join(' ');
  }
}
