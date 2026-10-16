// Fuente configurable (VITE_SOURCE=mock|api). Aísla la API de la lógica visual.
import type { Fetcher, Page } from './types';
const STATUS = ['Alive', 'Dead', 'unknown'];
export function createMockFetcher(delay = 400, pages = 4, size = 6): Fetcher {
  return (url, signal) => new Promise<Page>((resolve, reject) => {
    const n = Number(url.split('/').pop());
    if (!Number.isSafeInteger(n) || n < 1 || n > pages) { reject(new Error("Página simulada inválida")); return; }
    if (signal.aborted) { reject(new DOMException("Aborted", "AbortError")); return; }
    const t = setTimeout(() => resolve({
      info: { next: n < pages ? `mock://page/${n + 1}` : null },
      results: Array.from({ length: size }, (_, i) => { const id = (n - 1) * size + i + 1;
        return { id, name: `Variante C-${id}`, status: STATUS[id % 3], species: id % 4 ? 'Human' : 'Alien' }; }),
    }), delay);
    signal.addEventListener('abort', () => { clearTimeout(t); reject(new DOMException('Aborted', 'AbortError')); });
  });
}
const apiFetcher: Fetcher = async (url, signal) => {
  const r = await fetch(url, { signal });
  if (!r.ok) throw new Error(`Error HTTP ${r.status}`);
  return r.json();
};
const useApi = import.meta.env?.VITE_SOURCE === 'api';
export const source = useApi
  ? { fetcher: apiFetcher, firstUrl: 'https://rickandmortyapi.com/api/character' }
  : { fetcher: createMockFetcher(), firstUrl: 'mock://page/1' };
