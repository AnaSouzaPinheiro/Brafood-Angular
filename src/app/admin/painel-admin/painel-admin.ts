import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { AdminCategorias } from './abas/admin-categorias/admin-categorias';
import { AdminDestaque } from './abas/admin-destaque/admin-destaque';
import { AdminSecoes } from './abas/admin-secoes/admin-secoes';
import { AdminSubcategorias } from './abas/admin-subcategorias/admin-subcategorias';

type Tab = 'categorias' | 'subcategorias' | 'secoes' | 'destaque';
const ABAS: Tab[] = ['categorias', 'subcategorias', 'secoes', 'destaque'];

/**
 * Painel administrativo: só o cabeçalho e as abas.
 * Cada aba é um componente próprio em ./abas (lógica, template e estilo).
 */
@Component({
  selector: 'bra-painel-admin',
  standalone: true,
  imports: [RouterLink, AdminCategorias, AdminSubcategorias, AdminSecoes, AdminDestaque],
  templateUrl: './painel-admin.html',
  styleUrl: './painel-admin.scss',
})
export class PainelAdmin {
  /** Aba vem da rota (/admin/:aba); valor desconhecido cai em "categorias". */
  private aba = toSignal(
    inject(ActivatedRoute).paramMap.pipe(
      map((p) => {
        const a = p.get('aba') as Tab;
        return ABAS.includes(a) ? a : 'categorias';
      }),
    ),
    { initialValue: 'categorias' as Tab },
  );

  /** Trocar de aba destrói a anterior, então os formulários abertos fecham sozinhos. */
  get tab(): Tab {
    return this.aba();
  }
}
