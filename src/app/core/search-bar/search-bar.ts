import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { ReceitaService } from '../../services/receita/receita.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { toSlug } from '../../utils/slug';

interface Sugestao {
  id: number;
  titulo: string;
  imagem1: string | null;
  categoria: string | null;
}

@Component({
  selector: 'bra-search-bar',
  standalone: true,
  imports: [FormsModule, RouterModule, CommonModule, MediaUrlPipe],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
})
export class SearchBar {
  termo: string = '';
  sugestoes: Sugestao[] = [];
  mostrarDropdown = false;
  carregando = false;

  private termoInput$ = new Subject<string>();

  isOpenMobile = false;

  constructor(
    private router: Router,
    private receitaService: ReceitaService,
  ) {
    this.termoInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((termo) => {
          if (termo.trim().length < 2) {
            this.sugestoes = [];
            this.carregando = false;
            this.mostrarDropdown = false;
            return [];
          }
          this.carregando = true;
          return this.receitaService.listForSerach(termo);
        }),
      )
      .subscribe({
        next: (receitas: any[]) => {
          this.sugestoes = receitas.slice(0, 6).map((r) => ({
            id: r.id,
            titulo: r.titulo,
            imagem1: r.imagem1 ?? null,
            categoria: r.categoria ?? null,
          }));
          // Abre mesmo sem resultado, para mostrar "Nenhum resultado".
          this.mostrarDropdown = true;
          this.carregando = false;
        },
        error: () => {
          this.sugestoes = [];
          this.carregando = false;
        },
      });
  }

  onInput() {
    this.termoInput$.next(this.termo);
  }

  buscar() {
    const texto = this.termo.trim();
    if (texto.length > 0) {
      this.fecharDropdown();
      this.router.navigate(['/pesquisa', texto]);
    }
  }

  irParaReceita(s: Sugestao) {
    this.fecharDropdown();
    this.termo = '';
    this.router.navigate([`/receita/${toSlug(s.titulo)}/${s.id}`]);
  }

  fecharDropdown() {
    this.mostrarDropdown = false;
    this.sugestoes = [];
  }

  // Fecha ao clicar fora
  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    const el = e.target as HTMLElement;
    if (!el.closest('bra-search-bar')) {
      this.fecharDropdown();
    }
  }

  toggleMobileSearch() {
    this.isOpenMobile = !this.isOpenMobile;
    // Ao fechar pelo ✕, some também a lista de sugestões / "Nenhum resultado".
    if (!this.isOpenMobile) {
      this.fecharDropdown();
      this.carregando = false;
    }
  }
}
