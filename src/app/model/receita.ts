export interface Receita {
  id: number;
  titulo: string;
  resumo?: string;
  categoria?: string;
  subcategoria?: string;
  dificuldade: number;
  tempo_hora: number;
  tempo_min: number;
  porcoes: number;
  tipo_porcao: string;
  imagem1: string;
  imagem2?: string;
  imagem3?: string;
  qtd_fav: number;
  data_criacao: string;
  autor: string;
  foto_perfil?: string;
  ingredientes: Ingrediente[];
  etapas: Etapa[];
}

export interface Ingrediente {
  titulo: string;
  itens: string[];
}

export interface Etapa {
  titulo: string;
  ordem: number;
  descricoes: Descricao[];
}

export interface Descricao {
  descricao: string;
  ordem: number;
}
