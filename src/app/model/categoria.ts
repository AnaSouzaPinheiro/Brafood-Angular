export interface Categoria {
  id: number;
  nome: string;
  icone: string;
  fundo: string;
  css_class: string;
  url: string;
  subcategorias: Subcategoria[];
}

export interface Subcategoria {
  id: number;
  nome: string;
  url: string;
}