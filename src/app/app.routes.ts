import { Routes } from '@angular/router';
import { AuthGuard } from './services/auth/auth-guard';
import { AdminGuard } from './services/admin/admin-guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./home/home/home').then((m) => m.Home),
  },
  {
    path: 'cadastro',
    loadComponent: () =>
      import('./auth/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'receita/:nome/:id',
    loadComponent: () => import('./recipe/recipe/recipe').then((m) => m.Recipe),
  },
  {
    path: 'editar-perfil/:id',
    loadComponent: () =>
      import('./profile/editar-perfil/editar-perfil').then(
        (m) => m.EditarPerfil,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'chef/:id',
    loadComponent: () =>
      import('./profile/perfil-publico/perfil-publico').then(
        (m) => m.PerfilPublicoPage,
      ),
  },
  {
    path: 'minhas-receitas/:id',
    loadComponent: () =>
      import('./profile/minhas-receitas/minhas-receitas').then(
        (m) => m.MinhasReceitas,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'favoritas/:id',
    loadComponent: () =>
      import('./profile/favoritas/favoritas').then((m) => m.Favoritas),
    canActivate: [AuthGuard],
  },
  {
    path: 'editar-receita/:nome/:id',
    loadComponent: () =>
      import('./recipe/update-recipe/update-recipe').then(
        (m) => m.UpdateRecipe,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'adicionar-receita',
    loadComponent: () =>
      import('./recipe/add-recipe/add-recipe').then((m) => m.AddRecipe),
    canActivate: [AuthGuard],
  },
  {
    path: 'adicionar-receita/hub',
    loadComponent: () =>
      import('./recipe/add-recipe-hub/add-recipe-hub').then(
        (m) => m.AddRecipeHub,
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'adicionar-receita/ai',
    loadComponent: () =>
      import('./recipe/add-recipe-ai/add-recipe-ai').then((m) => m.AddRecipeAi),
    canActivate: [AuthGuard],
  },
  {
    path: 'categoria/:nome/:id',
    loadComponent: () =>
      import('./category/categoria/categoria').then((m) => m.Categoria),
  },
  {
    path: 'pesquisa/:nome',
    loadComponent: () => import('./shared/search/search').then((m) => m.Search),
  },
  {
    path: 'recuperar-senha',
    loadComponent: () =>
      import('./auth/recuperar-senha/recuperar-senha').then(
        (m) => m.RecuperarSenha,
      ),
  },
  {
    path: 'resetar-senha/:token',
    loadComponent: () =>
      import('./auth/resetar-senha/resetar-senha').then((m) => m.ResetarSenha),
  },
  {
    path: 'termos',
    loadComponent: () => 
      import('./pages/termos/termos').then((m) => m.Termos),
  },
  {
    path: 'privacidade',
    loadComponent: () =>
      import('./pages/privacidade/privacidade').then((m) => m.Privacidade),
  },
  {
    path: 'cookies',
    loadComponent: () =>
      import('./pages/cookies/cookies').then((m) => m.Cookies),
  },
  {
    path: 'contato',
    loadComponent: () =>
      import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./admin/painel-admin/painel-admin').then((m) => m.PainelAdmin),
    canActivate: [AuthGuard, AdminGuard],
  },
  { path: '**', redirectTo: 'home' },
];
