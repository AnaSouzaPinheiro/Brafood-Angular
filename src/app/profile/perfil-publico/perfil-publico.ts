import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { PerfilPublico, PerfilPublicoService } from '../../services/perfil-publico/perfil-publico.service';
import { QuadroResumo, QuadroService } from '../../services/quadro/quadro.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { RecipeCardSkeleton } from '../../shared/recipe-card-skeleton/recipe-card-skeleton';
import { toSlug } from '../../utils/slug';

@Component({
  selector: 'bra-perfil-publico',
  standalone: true,
  imports: [CommonModule, RouterModule, RecipeCard, RecipeCardSkeleton, MediaUrlPipe],
  templateUrl: './perfil-publico.html',
  styleUrl: './perfil-publico.scss',
})
export class PerfilPublicoPage {
  perfil = signal<PerfilPublico | null>(null);
  quadros = signal<QuadroResumo[]>([]);
  carregando = true;
  erro = false;

  private destroyRef = inject(DestroyRef);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private perfilService: PerfilPublicoService,
    private quadroService: QuadroService,
  ) {}

  ngOnInit() {
    // Reage à troca do parâmetro (ir de um perfil para outro reaproveita o componente)
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.carregar(params.get('apelido') ?? ''));
  }

  private carregar(apelidoOuId: string) {
    this.perfil.set(null);
    this.erro = false;
    this.carregando = true;

    if (!apelidoOuId) {
      this.erro = true;
      this.carregando = false;
      return;
    }

    this.perfilService.buscar(apelidoOuId).subscribe({
      next: (data) => {
        // Link antigo (/chef/5): troca a URL para /chef/{apelido} sem recarregar
        if (/^\d+$/.test(apelidoOuId) && data.usuario.apelido) {
          this.router.navigate(['/chef', data.usuario.apelido], { replaceUrl: true });
          return;
        }
        this.perfil.set(data);
        this.carregando = false;
        this.carregarQuadros(data.usuario.apelido);
      },
      error: () => {
        this.erro = true;
        this.carregando = false;
      },
    });
  }

  /** Quadros que o autor deixou públicos (só os que têm receitas). */
  private carregarQuadros(apelido: string) {
    this.quadros.set([]);
    if (!apelido) return;
    this.quadroService.publicosDoUsuario(apelido).subscribe({
      next: (lista) => this.quadros.set(Array.isArray(lista) ? lista : []),
      error: () => {},
    });
  }

  /** Sempre 4 posições no mosaico. */
  mosaico(capas: string[]): (string | null)[] {
    return [0, 1, 2, 3].map((i) => capas[i] ?? null);
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