import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LoggerService } from '../../services/logger/logger.service';
import { MediaUrlPipe } from '../../shared/pipes/media-url.pipe';
import { toSlug } from '../../utils/slug';
import { RecipeResume } from '../recipe-resume/recipe-resume';

/** Subcategoria como vem embutida na receita (raw da API). */
interface SubcategoriaCard {
  id: number | string;
  nome: string;
}

/**
 * Formato de receita "normalizado" que esse componente monta pra si
 * mesmo (`mappedRecipe`) a partir do `recipe` recebido — puramente
 * interno, então dá pra tipar sem mentira nenhuma.
 */
interface MappedRecipe {
  category: string | null;
  subcategory: string | null;
  img: string;
  url: string;
  resume: {
    title: string;
    qtdFav: number;
    text: string;
  };
}

@Component({
  selector: 'bra-recipe-card',
  standalone: true,
  imports: [RecipeResume, RouterModule, CommonModule, MediaUrlPipe],
  templateUrl: './recipe-card.html',
  styleUrl: './recipe-card.scss',
})
export class RecipeCard {
  private logger = inject(LoggerService);

  // `recipe` fica `any` de propósito: esse componente é alimentado tanto
  // com objetos já mapeados pro card (formato `Recipes`, vindo de
  // favoritas/recipe-section/search) quanto com receitas cruas da API
  // (formato `Receita`, vindo de minhas-receitas) — são dois formatos
  // diferentes de verdade, não preguiça de tipar. O ideal a médio prazo
  // é normalizar pra um formato só antes de chegar aqui; até lá, forçar
  // um tipo único só ia mentir sobre o que realmente chega.
  @Output() editar = new EventEmitter<any>();

  @Input() myRecipe: boolean = false;
  @Input() selectedSubcategories!: number[];
  @Input() recipe: any;
  @Input() cardExibir: 'categoria' | 'subcategoria' = 'categoria';

  mappedRecipe: MappedRecipe | null = null;
  imgBroken: boolean = false;
  /** Miniatura falhou → tenta a imagem original antes de mostrar o placeholder. */
  thumbFalhou = false;

  ngOnChanges() {
    if (!this.recipe) return;
    this.imgBroken = false;
    this.thumbFalhou = false;

    // Garantir que subs seja array de objetos
    let subs: SubcategoriaCard[] = [];
    if (Array.isArray(this.recipe.subcategorias)) {
      subs = this.recipe.subcategorias;
    } else if (typeof this.recipe.subcategorias === 'string') {
      try {
        subs = JSON.parse(this.recipe.subcategorias);
      } catch (e) {
        this.logger.warn('Erro ao parsear subcategorias:', e);
        subs = [];
      }
    }

    let chosenSub: SubcategoriaCard | null = null;

    // Se houver filtro de subcategoria, pega a primeira que a receita possui
    if (this.selectedSubcategories && this.selectedSubcategories.length > 0) {
      chosenSub =
        subs.find((s) =>
          this.selectedSubcategories.includes(Number(s.id)),
        ) || null;
    }

    // Se não houver filtro ou não encontrou nenhuma do filtro, pega a primeira subcategoria da receita
    if (!chosenSub && subs.length > 0) {
      chosenSub = subs[0];
    }

    this.mappedRecipe = {
      category: this.recipe.categoria
        ? this.recipe.categoria.split(',')[0].trim()
        : null,
      subcategory: chosenSub
        ? chosenSub.nome
        : (this.recipe.subcategoria ?? null), // fallback para campo direto (modo aleatório)
      img: this.recipe.imagem1,
      url: `/receita/${toSlug(this.recipe.titulo)}/${this.recipe.id}`,
      resume: {
        title: this.recipe.titulo,
        qtdFav: Number(this.recipe.qtd_fav),
        text: this.recipe.resumo,
      },
    };
  }

  /** Label exibido no topo do card conforme configuração da seção */
  get labelDoCard(): string | null {
    if (!this.mappedRecipe) return null;

    if (this.cardExibir === 'subcategoria') {
      return (
        this.mappedRecipe.subcategory ?? this.mappedRecipe.category ?? null
      );
    }

    return this.mappedRecipe.category ?? null;
  }

  @Output() excluir = new EventEmitter<number>();

  // ---- Uso em quadros (área pessoal) ---------------------------------------
  // Conteúdo extra pode ser encaixado DENTRO do bloco da imagem:
  //   [cardSelos] → marcadores abaixo do rótulo de categoria
  //   [cardAcoes] → botão no canto superior direito (aparece no hover do card)
  /** Modo seleção: clicar marca/desmarca em vez de abrir a receita. */
  @Input() selecionavel = false;
  @Input() selecionado = false;
  /** Mantém o card "levantado" (ex.: com o menu ⋯ aberto). */
  @Input() ativo = false;
  @Output() alternarSelecao = new EventEmitter<void>();

  onClickCard(event: Event) {
    if (!this.selecionavel) return;
    event.preventDefault();
    this.alternarSelecao.emit();
  }

  onEditar(event: Event) {
    event.stopPropagation();
    this.editar.emit(this.recipe);
  }

  onExcluir(event: Event) {
    event.stopPropagation();
    this.excluir.emit(this.recipe.id);
  }
}