import { Injectable } from '@angular/core';

export interface FiltroState {
  ordenar: string;
  categorias: string[]; // usado em search e minhas-receitas
  subcategorias: number[]; // usado em categoria
  dificuldades: number[];
  tiposPorcao: string[];
  tempoMax: number | null;
  tempoMin: number | null;
}

export const FILTRO_INICIAL: FiltroState = {
  ordenar: 'nome',
  categorias: [],
  subcategorias: [],
  dificuldades: [],
  tiposPorcao: [],
  tempoMax: null,
  tempoMin: null,
};

export const MAPA_ORDENACAO: Record<string, string> = {
  'Por nome': 'nome',
  'Mais novas': 'mais_novos',
  'Mais antigas': 'mais_antigos',
  'Mais favoritas': 'mais_favoritos',
};

export const MAPA_TIPO_PORCAO: Record<number, string> = {
  1: 'Porções',
  2: 'Pedaços',
  3: 'Pratos',
  4: 'Fatias',
  5: 'Unidades',
};

export const OPTIONS_ORDENAR = {
  labelTitle: 'Ordenar Por:',
  items: [
    { name: 'Por nome', checked: true },
    { name: 'Mais novas', checked: false },
    { name: 'Mais antigas', checked: false },
    { name: 'Mais favoritas', checked: false },
  ],
};

export const OPTIONS_DIFICULDADE = {
  labelTitle: 'Dificuldade:',
  items: [
    { id: 0, name: 'Todas', checked: true },
    { id: 1, name: 'Fácil', checked: false },
    { id: 2, name: 'Médio', checked: false },
    { id: 3, name: 'Difícil', checked: false },
  ],
};

export const OPTIONS_TEMPO = {
  labelTitle: 'Tempo de preparo:',
  items: [
    {
      name: 'Qualquer tempo',
      checked: true,
      tempoMax: null as number | null,
      tempoMin: null as number | null,
    },
    {
      name: 'Rápido (até 30 min)',
      checked: false,
      tempoMax: 30,
      tempoMin: null as number | null,
    },
    {
      name: 'Médio (até 1 hora)',
      checked: false,
      tempoMax: 60,
      tempoMin: null as number | null,
    },
    {
      name: 'Longo (acima de 1 hora)',
      checked: false,
      tempoMax: null as number | null,
      tempoMin: 61,
    },
  ],
};

export const OPTIONS_TIPO_PORCAO = {
  labelTitle: 'Tipo de porção:',
  items: [
    { id: 0, name: 'Todos', checked: true },
    { id: 1, name: 'Porções', checked: false },
    { id: 2, name: 'Pedaços', checked: false },
    { id: 3, name: 'Pratos', checked: false },
    { id: 4, name: 'Fatias', checked: false },
    { id: 5, name: 'Unidades', checked: false },
  ],
};

/**
 * Serviço utilitário sem estado global — provê helpers de filtragem e ordenação
 * reutilizáveis por qualquer componente que trabalhe com receitas.
 */
@Injectable({ providedIn: 'root' })
export class FilterStateService {
  clonarFiltro(f: FiltroState): FiltroState {
    return {
      ordenar: f.ordenar,
      categorias: [...f.categorias],
      subcategorias: [...f.subcategorias],
      dificuldades: [...f.dificuldades],
      tiposPorcao: [...f.tiposPorcao],
      tempoMax: f.tempoMax,
      tempoMin: f.tempoMin,
    };
  }

  filtroInicial(ordenar: string = FILTRO_INICIAL.ordenar): FiltroState {
    return { ...this.clonarFiltro(FILTRO_INICIAL), ordenar };
  }

  contarFiltrosAtivos(filtros: FiltroState): number {
    let count = 0;
    if (filtros.ordenar !== 'nome') count++;
    count += filtros.categorias.length;
    count += filtros.subcategorias.length;
    count += filtros.dificuldades.length;
    count += filtros.tiposPorcao.length;
    if (filtros.tempoMax != null || filtros.tempoMin != null) count++;
    return count;
  }

  aplicarFiltrosFrontend(receitas: any[], filtros: FiltroState): any[] {
    let resultado = [...receitas];

    if (filtros.categorias.length)
      resultado = resultado.filter((r) =>
        filtros.categorias.includes(r.categoria),
      );

    if (filtros.dificuldades.length)
      resultado = resultado.filter((r) =>
        filtros.dificuldades.includes(r.dificuldade),
      );

    if (filtros.tiposPorcao.length)
      resultado = resultado.filter((r) =>
        filtros.tiposPorcao.includes(r.tipo_porcao),
      );

    if (filtros.tempoMax != null)
      resultado = resultado.filter(
        (r) => r.tempo_hora * 60 + r.tempo_min <= filtros.tempoMax!,
      );

    if (filtros.tempoMin != null)
      resultado = resultado.filter(
        (r) => r.tempo_hora * 60 + r.tempo_min >= filtros.tempoMin!,
      );

    switch (filtros.ordenar) {
      case 'nome':
        resultado.sort((a, b) => a.titulo.localeCompare(b.titulo));
        break;
      case 'mais_novos':
        resultado.sort((a, b) => b.id - a.id);
        break;
      case 'mais_antigos':
        resultado.sort((a, b) => a.id - b.id);
        break;
      case 'mais_favoritos':
        resultado.sort((a, b) => b.qtd_fav - a.qtd_fav);
        break;
    }

    return resultado;
  }
}