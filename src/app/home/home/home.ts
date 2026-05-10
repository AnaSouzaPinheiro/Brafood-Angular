import { Component, OnInit } from '@angular/core';
import { SlideHome } from '../slide-home/slide-home';
import { RecipeSection } from '../../shared/recipe-section/recipe-section';
import { CommonModule } from '@angular/common';
import { Section } from '../../model/section-home';
import { ReceitaService } from '../../services/receita/receita.service';
import { SecaoService } from '../../services/secao/secao.service';
import { Recipes } from '../../model/myrecipes';

@Component({
  selector: 'bra-home',
  imports: [SlideHome, RecipeSection, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home implements OnInit {
  sections: Section[] = [];
  slides: Recipes[] = []; // carrossel principal

  constructor(
    private secaoService: SecaoService,
    private ReceitaServices: ReceitaService
  ) {}

  ngOnInit() {
    // Slide principal
    this.ReceitaServices.listRandom(5).subscribe((slides) => {
      this.slides = slides.map((r: any) => ({
        id: r.id,
        category: '',
        img: r.img,
        url: r.url,
        resume: {
          title: r.resume.title,
          qtdFav: Number(r.resume.qtdFav),
          text: r.resume.text,
        },
      }));
    });

    // Seções de receitas 
    this.secaoService.getSecoes().subscribe((data) => {
      this.sections = data.map((secao: any) => {
        const recipes = (secao.receitas || []).map((r: any) => ({
          id: r.id,
          categoria: r.categoria,
          url: `/receita/${r.id}`,
          imagem1: r.imagem1,
          titulo: r.titulo,
          qtd_fav: r.qtd_fav,
          resumo: r.resumo,
        }));

        return {
          id: secao.id,
          title: secao.titulo,
          urlSection: secao.url_fundo,
          fundoTitle: secao.fundo_titulo,
          recipes,
        } as Section;
      });
    });
  }

  trackById(index: number, section: Section): any {
    return section.id || index;
  }
}
