export interface Recipes {
  id: number;
  category: string;
  img: string;
  url: string;
  tempo_hora?: number;
  tempo_min?: number;
  resume: {
    title: string;
    qtdFav: number;
    text: string;
  };
  subcategorias?: string[];
}
