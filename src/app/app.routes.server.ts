import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // ROTAS DINÂMICAS
  {
    path: 'receita/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'editar-perfil/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'minhas-receitas/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'favoritas/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'editar-receita/:id',
    renderMode: RenderMode.Client,
  },
  {
    path: 'categoria/:id/:nome',
    renderMode: RenderMode.Client,
  },
  {
    path: 'pesquisa/:nome',
    renderMode: RenderMode.Client,
  },
  {
    path: 'resetar-senha/:token',
    renderMode: RenderMode.Client,
  },

  // ROTAS FIXAS
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'home',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'login',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'cadastro',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'recuperar-senha',
    renderMode: RenderMode.Prerender,
  },

  // fallback
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
