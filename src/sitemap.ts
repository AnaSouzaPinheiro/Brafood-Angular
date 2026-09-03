import { environment } from './environments/environment';

const SITE_URL = 'https://brafood.page.gd';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

interface SitemapUrl {
  loc: string;
  changefreq?: string;
  priority?: string;
  lastmod?: string;
}

let cachedXml: string | null = null;
let cachedAt = 0;

// Páginas públicas estáticas (fora as que exigem login: editar-perfil,
// minhas-receitas, favoritas, editar-receita, adicionar-receita, admin)
const STATIC_URLS: SitemapUrl[] = [
  { loc: '/home', changefreq: 'daily', priority: '1.0' },
  { loc: '/termos', changefreq: 'yearly', priority: '0.3' },
  { loc: '/privacidade', changefreq: 'yearly', priority: '0.3' },
  { loc: '/cookies', changefreq: 'yearly', priority: '0.3' },
  { loc: '/contato', changefreq: 'yearly', priority: '0.3' },
];

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${environment.apiUrl}/${path}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function buildXml(urls: SitemapUrl[]): string {
  const items = urls
    .map((u) => {
      const parts = [`    <loc>${escapeXml(SITE_URL + u.loc)}</loc>`];
      if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
      if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
      if (u.priority) parts.push(`    <priority>${u.priority}</priority>`);
      return `  <url>\n${parts.join('\n')}\n  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</urlset>\n`;
}

/**
 * Monta o sitemap.xml juntando as páginas estáticas com as receitas e
 * categorias vindas da API PHP. Resultado fica em cache por CACHE_TTL_MS
 * pra não bater na API a cada visita de crawler.
 */
export async function generateSitemap(): Promise<string> {
  const now = Date.now();
  if (cachedXml && now - cachedAt < CACHE_TTL_MS) {
    return cachedXml;
  }

  const urls: SitemapUrl[] = [...STATIC_URLS];

  const [receitas, categorias] = await Promise.all([
    fetchJson<Array<{ url: string }>>('receitas.php'),
    fetchJson<Array<{ url: string }>>('categorias.php'),
  ]);

  receitas?.forEach((r) => {
    if (r.url) urls.push({ loc: r.url, changefreq: 'weekly', priority: '0.8' });
  });

  categorias?.forEach((c) => {
    if (c.url) urls.push({ loc: c.url, changefreq: 'weekly', priority: '0.6' });
  });

  cachedXml = buildXml(urls);
  cachedAt = now;
  return cachedXml;
}
