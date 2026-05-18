import { Recipes } from './myrecipes';

export interface Section {
  id: number;
  title: string;
  /** Caminho de imagem OU null quando usa cor de fundo */
  urlSection: string | null;
  /** Cor CSS de fundo (ex.: '#ff5733') — usada quando urlSection for null */
  corFundo: string | null;
  fundoTitle: string | null;
  ordem: number;
  recipes: Recipes[];
  /** Cor do título: 'solido' ou 'gradiente' */
  tituloCorTipo: 'solido' | 'gradiente';
  tituloCorSolid: string | null;
  tituloGradiente1: string | null;
  tituloGradiente2: string | null;
}
