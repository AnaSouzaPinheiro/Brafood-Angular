import { Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  {
    path: 'home',
    loadComponent: () => import('./home/home/home').then((m) => m.Home),
  },
  {
    path: 'cadastro',
    loadComponent: () => import('./auth/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
  },
  {
    path: 'receita/:id', 
    loadComponent: () => import('./recipe/recipe/recipe').then(m => m.Recipe) ,
  },
  {
    path: 'editar-perfil',
    loadComponent: () => import('./profile/editar-perfil/editar-perfil').then((m) => m.EditarPerfil),
  },
  {
    path: 'minhas-receitas',
    loadComponent: () => import('./profile/minhas-receitas/minhas-receitas').then((m) => m.MinhasReceitas),
  },
  {
    path: 'categoria/:id/:nome',
    loadComponent: () => import('./category/categoria/categoria').then((m) => m.Categoria),
  },
  { path: '**', redirectTo: 'home' } 
];
