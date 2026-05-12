import { Component } from '@angular/core';
import { CustomButton } from '../../shared/custom-button/custom-button';
import { Perfil } from '../perfil/perfil';
import { Router, RouterModule } from '@angular/router';
import { RecipeCard } from '../../recipe/recipe-card/recipe-card';
import { ReceitaService } from '../../services/receita/receita.service';
import { Recipes } from '../../model/myrecipes';
import { AuthService } from '../../services/auth/auth.service';
import { User } from '../../model/user';
import { ModalService } from '../../services/modal/modal.service';
import { toSlug } from '../../utils/slug';
import { Receita } from '../../model/receita';

@Component({
  selector: 'bra-minhas-receitas',
  standalone: true,
  imports: [Perfil, CustomButton, RecipeCard, RouterModule],
  templateUrl: './minhas-receitas.html',
  styleUrls: ['./minhas-receitas.scss'],
})
export class MinhasReceitas {
  indice!: number;
  currentPage!: number;

  Recipes: Recipes[] = [];

  logado = false;
  userId: string | null = null;
  user!: User;

  constructor(
    private ReceitaServices: ReceitaService,
    private auth: AuthService,
    private router: Router,
    private modalService: ModalService,
  ) {
    this.logado = this.auth.isLoggedIn();

    const userData = localStorage.getItem('user');
    if (userData) {
      this.userId = JSON.parse(userData).id;
    }

    if (this.userId) {
      this.ReceitaServices.listPorUser(Number(this.userId)).subscribe(
        (data) => {
          this.Recipes = data;
        },
      );
    }
  }

  ngOnInit(): void {
    this.indice = 0;
    this.currentPage = 1;
  }

  get myRecipesPage() {
    return this.Recipes.slice(this.indice, this.indice + 6);
  }

  get pages(): number {
    return Math.ceil(this.Recipes.length / 6);
  }

  get pagesArray(): number[] {
    return Array.from({ length: this.pages }, (_, i) => i + 1);
  }

  nextPage() {
    let newIndex = this.indice + 6;
    if (newIndex >= this.Recipes.length) {
      newIndex = 0;
    }
    this.indice = newIndex;
    this.currentPage = this.indice / 6 + 1;
  }

  prevPage() {
    let newIndex = this.indice - 6;
    if (newIndex < 0) {
      newIndex = (this.pages - 1) * 6;
    }
    this.indice = newIndex;
    this.currentPage = this.indice / 6 + 1;
  }

  goToPage(page: number) {
    this.indice = (page - 1) * 6;
    this.currentPage = page;
  }

  editarReceita(recipe: Receita) {
    this.router.navigate(['/editar-receita', toSlug(recipe.titulo), recipe.id]);
  }

  excluirReceita(id: number) {
    this.modalService.open({
      type: 'warning',
      title: 'Excluir receita',
      message:
        'Tem certeza que deseja excluir esta receita? Essa ação não pode ser desfeita.',
      confirmText: 'Excluir',
      cancelText: 'Cancelar',
      onConfirm: () => {
        this.confirmarExclusao(id);
      },
    });
  }

  private confirmarExclusao(id: number) {
    this.ReceitaServices.excluir(id).subscribe({
      next: () => {
        // remove da lista sem reload
        this.Recipes = this.Recipes.filter((r) => r.id !== id);

        this.modalService.open({
          type: 'success',
          title: 'Receita excluída',
          message: 'A receita foi excluída com sucesso!',
          confirmText: 'OK',
        });
      },
      error: () => {
        this.modalService.open({
          type: 'error',
          title: 'Erro',
          message: 'Não foi possível excluir a receita. Tente novamente.',
        });
      },
    });
  }
}
