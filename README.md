# BraFood

Plataforma de receitas que permite descobrir, publicar, avaliar e salvar receitas. O projeto combina uma SPA Angular com renderização no servidor (SSR) e uma API PHP/MySQL mantida no repositório irmão `../BraFood-PHP`.

## O que já existe

- Catálogo de receitas com busca, categorias, subcategorias, ordenação e filtros por dificuldade, porção e tempo.
- Página de receita com galeria de imagens, vídeo incorporado, ingredientes, modo de preparo, avaliação, comentários, favoritos e compartilhamento de ingredientes pelo WhatsApp.
- Cadastro, login por token Bearer, logout, recuperação e redefinição de senha.
- Perfis públicos de chefs, edição de perfil, receitas publicadas pelo usuário e lista de favoritos.
- Criação, edição e exclusão de receitas, com capa, galeria e fluxo alternativo de geração de receita por IA.
- Home administrável com slide, seções/carrosséis e receita em destaque.
- Painel administrativo para categorias, subcategorias, seções, vínculo de receitas, imagens e destaque semanal.
- Newsletter, formulário de contato, páginas de termos, privacidade e cookies, além de banner de consentimento.
- Sitemap dinâmico com receitas e categorias, cacheado por uma hora no servidor SSR.

## Tecnologias

| Camada | Tecnologias |
| --- | --- |
| Front-end | Angular 20, TypeScript, SCSS, RxJS e Font Awesome subsetado |
| Renderização | Angular SSR, hidratação com event replay e Express 5 |
| API | PHP, PDO/MySQL, PHPMailer e dotenv |
| Qualidade | ESLint, Jasmine/Karma no front-end e PHPUnit na API |

## Estrutura

```text
BraFood-Angular/
├── public/                 # Arquivos públicos, incluindo robots.txt
├── src/
│   ├── app/
│   │   ├── admin/          # Painel administrativo
│   │   ├── auth/           # Cadastro, login e recuperação de senha
│   │   ├── category/       # Listagem por categoria e filtros
│   │   ├── core/           # Navbar, rodapé, busca, cookies e elementos globais
│   │   ├── home/           # Banner, slide, destaque e seções da home
│   │   ├── model/          # Contratos da aplicação
│   │   ├── pages/          # Contato e páginas legais
│   │   ├── profile/        # Perfil, perfil público, favoritas e minhas receitas
│   │   ├── recipe/         # Leitura, cards e gestão de receitas
│   │   ├── services/       # Integrações HTTP e estado reutilizável
│   │   └── shared/         # Componentes, pipes e skeletons compartilhados
│   ├── assets/             # Imagens e fontes locais
│   ├── environments/       # URLs da API por ambiente
│   ├── sitemap.ts          # Geração dinâmica de sitemap.xml
│   └── server.ts           # Servidor Express/SSR
├── angular.json
```

## Arquitetura e padrões

- **Standalone components e lazy loading:** todas as páginas são componentes standalone e as rotas carregam seus componentes sob demanda.
- **Organização por domínio:** `recipe`, `profile`, `auth`, `home`, `category` e `admin` agrupam UI e regras específicas; `core` reúne o layout global; `shared` contém elementos reaproveitáveis.
- **Serviços centralizados:** `BaseService` constrói as URLs da API e os serviços especializados encapsulam cada domínio (`ReceitaService`, `AuthService`, `CategoriaService`, etc.).
- **Autorização:** o `authInterceptor` adiciona `Authorization: Bearer <token>` automaticamente. `AuthGuard` protege rotas autenticadas e `AdminGuard` restringe o painel administrativo.
- **Estado local:** a sessão fica em `signal` no `AuthService` e é reidratada a partir do `localStorage` somente no navegador, preservando a compatibilidade com SSR.
- **Experiência de carregamento:** cards, detalhes e perfis possuem skeletons; toast e modal são serviços/componentes globais.
- **Estilo:** SCSS por componente, variáveis e parciais globais em `src/styles/`; a fonte principal é Poppins.

## Rotas principais

| Rota | Finalidade | Acesso |
| --- | --- | --- |
| `/home` | Página inicial, slide, destaque e seções | Público |
| `/receita/:nome/:id` | Detalhe de uma receita | Público, SSR |
| `/categoria/:nome/:id` | Receitas de uma categoria com filtros | Público |
| `/pesquisa/:nome` | Resultado de busca | Público |
| `/chef/:id` | Perfil público do autor | Público |
| `/cadastro`, `/login` | Autenticação | Público |
| `/recuperar-senha`, `/resetar-senha/:token` | Recuperação de acesso | Público |
| `/adicionar-receita`, `/adicionar-receita/hub`, `/adicionar-receita/ai` | Publicação de receitas | Autenticado |
| `/editar-receita/:nome/:id` | Edição de receita | Autenticado |
| `/editar-perfil/:id`, `/minhas-receitas/:id`, `/favoritas/:id` | Área do usuário | Autenticado |
| `/admin` | Administração de conteúdo | Administrador |
| `/termos`, `/privacidade`, `/cookies`, `/contato` | Páginas institucionais | Público |

As páginas estáticas são prerenderizadas. A página de receita é renderizada no servidor; áreas autenticadas e páginas dependentes de estado do usuário são renderizadas no cliente.

## Pré-requisitos

- Node.js 20 ou superior e npm.
- API disponível: PHP 8.1+ com extensões PDO MySQL e `mbstring`, MySQL/MariaDB e Composer.
- XAMPP ou outro servidor web/PHP para o ambiente local da API.

## Executando localmente

### 1. Inicie a API

Este front-end usa, em desenvolvimento, a URL `http://localhost/BraFood/BraFood-PHP` (definida em `src/environments/environment.development.ts`).

No repositório da API:

```bash
cd ../BraFood-PHP
composer install
```

Copie `.env.example` para `.env` e preencha banco de dados, SMTP e, se for utilizar a geração de receitas, `OPENROUTER_API_KEY`. Configure o virtual host/Apache para servir a pasta `BraFood-PHP` em `http://localhost/BraFood/BraFood-PHP`.

> Não versione segredos. Em produção, a API usa configuração própria do ambiente; o arquivo `.env` é destinado ao desenvolvimento local.

### 2. Instale e execute o front-end

```bash
npm ci
npm start
```

Abra `http://localhost:4200`.

Para apontar para outro backend local, altere somente `apiUrl` em `src/environments/environment.development.ts`. A configuração de produção usa `https://brafood.page.gd/api`.

## Comandos úteis

| Comando | Descrição |
| --- | --- |
| `npm start` | Servidor Angular de desenvolvimento |
| `npm run build` | Build de produção, incluindo artefatos de servidor SSR |
| `npm run watch` | Build contínuo para desenvolvimento |
| `npm run serve:ssr:BraFood-Angular` | Serve o build SSR na porta `4000` (após o build) |
| `npm test` | Testes unitários com Jasmine/Karma |
| `npm run lint` | Lint de TypeScript e templates Angular |
| `npm run icons:subset` | Atualiza o subconjunto local de ícones Font Awesome |

Na API, execute `vendor/bin/phpunit` para rodar a suíte PHPUnit.

## Integração com a API

As requisições do front-end seguem o prefixo `{{apiUrl}}/routes`. Os principais grupos de endpoints são:

- `receitas.php`, `receitas_categoria.php` e `receitas/*`: catálogo, filtros e CRUD de receitas com `multipart/form-data` para imagens.
- `login.php`, `cadastro.php`, `logout.php`, `solicitar_recuperacao.php` e `resetar_senha.php`: acesso e recuperação de conta.
- `favorito.php`, `avaliacao.php` e `comentarios.php`: interações com receitas.
- `user.php`, `updateUser.php`, `perfil_publico.php` e `minhas_receitas.php`: perfis e conteúdo do usuário.
- `categorias.php`, `slide_home.php`, `secoes_carrossel.php` e `receita_destaque.php`: conteúdo público da home.
- `admin/*`: administração de categorias, subcategorias, seções e imagens.
- `ai/gerar-receita.php`, `newsletter.php` e `envia_email.php`: integrações complementares.

O token retornado no login é persistido localmente e enviado pelo interceptor. A API valida o Bearer token e também verifica propriedade do recurso nas operações sensíveis.

## Publicação

## Contribuição

1. Mantenha componentes standalone e prefira acrescentar regras de integração em serviços.
2. Reutilize componentes de `shared` e elementos globais de `core` antes de criar duplicações.
3. Proteja novas rotas privadas com os guards adequados.
4. Execute `npm run lint` e `npm test` antes de enviar alterações.
5. Se a mudança afetar contratos, atualize front-end e API de forma coordenada.

## Licença

Este repositório não declara licença. Consulte os responsáveis pelo projeto antes de redistribuir ou reutilizar o código.
