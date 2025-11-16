import { Component } from '@angular/core';
import { RecipeImages } from '../recipe-images/recipe-images';
import { InfoRecipe } from '../info-recipe/info-recipe';
import { UserIcon } from '../../core/user-icon/user-icon';

import { ActivatedRoute } from '@angular/router';

import { Receita, Ingrediente, Etapa, Descricao } from '../../model/receita';
import { MyRecipesService } from '../../services/my-recipes';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'bra-recipe',
  imports: [RecipeImages, InfoRecipe, UserIcon, CommonModule],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss',
})
export class Recipe {
  recipe!: Receita;

  constructor(
    private route: ActivatedRoute,
    private myRecipesServices: MyRecipesService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.myRecipesServices.buscarPorId(id).subscribe((r: any) => {
      this.recipe = {
        id: Number(r.id),
        titulo: r.titulo,
        resumo: '',
        categoria: r.categoria,
        subcategoria: '',
        dificuldade: Number(r.dificuldade),
        tempo_hora: Number(r.tempo_hora),
        tempo_min: Number(r.tempo_min),
        porcoes: r.porcoes,
        tipo_porcao: r.tipo_porcao,
        imagem1: r.imagem1,
        imagem2: r.imagem2,
        imagem3: r.imagem3,
        qtd_fav: Number(r.qtd_fav),
        data_criacao: r.data_criacao
          ? new Date(r.data_criacao).toLocaleDateString('pt-BR')
          : '',
        autor: r.autor,
        ingredientes: (r.ingredientes || []).map((i: any) => ({
          titulo: i.titulo,
          itens: i.itens || [],
        })),
        etapas: (r.etapas || []).map((e: any) => ({
          titulo: e.titulo,
          ordem: Number(e.ordem),
          descricoes: (e.descricoes || []).map((d: any) => ({
            descricao: d.descricao,
            ordem: Number(d.ordem),
          })),
        })),
      };
    });
  }
}
