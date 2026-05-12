export function toSlug(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')                        // separa letras dos acentos
    .replace(/[\u0300-\u036f]/g, '')         // remove os acentos
    .replace(/[^a-z0-9\s-]/g, '')           // remove caracteres especiais
    .trim()
    .replace(/\s+/g, '-');                   // espaços viram hífens
}