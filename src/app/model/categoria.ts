export interface Categoria {
  id: number;
  nome: string;
  icone: string;
  fundo: string;
  css_class: string;
  ordem: number;
  cor_primaria?: string;
  gradiente_hover?: string;
  url: string;
  subcategorias: Subcategoria[];
}

export interface Subcategoria {
  id: number;
  nome: string;
  id_categoria?: number;
  nome_categoria?: string;
  url: string;
}