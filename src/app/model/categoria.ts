export interface Categoria {
  id: number;
  nome: string;
  icon: string;
  fundo: string;
  cssClass: string;
  url: string;
  subcategorias: Subcategoria[];
}

export interface Subcategoria {
  id: number;
  nome: string;
  url: string;
}