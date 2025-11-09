import { Recipes } from './myrecipes';

export interface Section {
  id: number; // chave única
  title: string;
  urlSection: string;
  fundoTitle: string;
  recipes: Recipes[];
}