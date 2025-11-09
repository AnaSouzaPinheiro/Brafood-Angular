export interface Recipes {
  id: number;
  category: string;
  img: string;
  url: string;
  resume: {
    title: string;
    qtdFav: number;
    text: string;
  };
}
