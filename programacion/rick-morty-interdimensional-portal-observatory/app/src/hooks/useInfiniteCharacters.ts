import { useCallback, useEffect, useRef, useState } from 'react';
import type { Character, Fetcher, Page } from '../api/types';

export type Phase = 'IDLE' | 'OBSERVING' | 'INTERSECTING' | 'FETCHING' | 'SUCCESS' | 'ERROR' | 'COMPLETE';
export interface Ev { id: number; t: number; type: string; detail?: string; ms?: number }
type EvIn = [string, string?, number?];
export interface State { characters: Character[]; next: string | null; phase: Phase; error: string | null; observer: 'connected' | 'disconnected';
  pages: number; started: number; completed: number; failed: number; active: number; lastMs: number | null; lastIntersection: number | null; events: Ev[] }
export const MAX_EVENTS = 50;

function validate(p: unknown): Page {
  if (!p || typeof p !== 'object') throw new Error('Respuesta con estructura inesperada');
  const d = p as Partial<Page>;
  if (!Array.isArray(d.results) || !d.results.every((c) => c && Number.isSafeInteger(c.id) && typeof c.name === 'string' && typeof c.status === 'string' && typeof c.species === 'string') || !d.info || !(typeof d.info.next === 'string' && d.info.next.trim().length > 0 || d.info.next === null))
    throw new Error('Respuesta con estructura inesperada');
  return d as Page;
}

/* INVARIANTES
 * I1 inflight===true ⇔ hay exactamente un fetch vigente; loadMore es no-op si inflight (sin duplicados).
 * I2 next.current es la única fuente síncrona de la URL siguiente; null ⇒ nunca más se solicita.
 * I3 Toda respuesta se descarta si su token (req) ya no es el vigente o su signal fue abortada (orden/desmontaje/Strict Mode).
 * I4 Los ids ya vistos no se añaden dos veces; una página 100% duplicada es error, no avance.
 * I5 events está acotado a MAX_EVENTS. Las animaciones no participan en esta lógica. */
export function useInfiniteCharacters(fetcher: Fetcher, firstUrl: string) {
  const [s, setS] = useState<State>({ characters: [], next: firstUrl, phase: 'IDLE', error: null, observer: 'disconnected',
    pages: 0, started: 0, completed: 0, failed: 0, active: 0, lastMs: null, lastIntersection: null, events: [] });
  const inflight = useRef(false), req = useRef(0), next = useRef<string | null>(firstUrl);
  const seen = useRef(new Set<number>()), visited = useRef(new Set<string>()), ctrl = useRef<AbortController | null>(null), evId = useRef(0), pagesLoaded = useRef(0);

  const upd = useCallback((patch: (p: State) => Partial<State>, evs: EvIn[] = []) => {
    const t = Math.round(performance.now());
    const made = evs.map(([type, detail, ms]) => ({ id: ++evId.current, t, type, detail, ms }));
    setS((p) => ({ ...p, ...patch(p), events: [...p.events, ...made].slice(-MAX_EVENTS) }));
  }, []);

  const loadMore = useCallback(async () => {
    const url = next.current;
    if (inflight.current || url === null) return;
    inflight.current = true;
    const id = ++req.current, c = new AbortController(); ctrl.current = c;
    const pageLabel = `página ${pagesLoaded.current + 1}`;
    const t0 = performance.now();
    upd((p) => ({ phase: 'FETCHING', active: 1, started: p.started + 1 }), [['FETCH_STARTED', pageLabel]]);
    try {
      const page = validate(await fetcher(url, c.signal));
      if (c.signal.aborted || id !== req.current) return;
      const ms = Math.round(performance.now() - t0);
      if (visited.current.has(url) || (page.info.next !== null && (page.info.next === url || visited.current.has(page.info.next)))) throw new Error('Ciclo o página repetida en info.next');
      const pageIds = new Set<number>();
      for (const ch of page.results) {
        if (pageIds.has(ch.id)) throw new Error('Identificadores duplicados en la página');
        pageIds.add(ch.id);
      }
      const fresh = page.results.filter((ch) => !seen.current.has(ch.id));
      if (page.results.length > 0 && fresh.length === 0) throw new Error('Página duplicada');
      visited.current.add(url);
      fresh.forEach((ch) => seen.current.add(ch.id));
      pagesLoaded.current++;
      next.current = page.info.next; inflight.current = false;
      const end = page.info.next === null;
      upd((p) => ({ characters: [...p.characters, ...fresh], next: page.info.next, pages: p.pages + 1, completed: p.completed + 1,
        active: 0, lastMs: ms, error: null, phase: end ? 'COMPLETE' : 'SUCCESS' }),
        [['FETCH_SUCCEEDED', pageLabel, ms], ['CHARACTERS_APPENDED', `+${fresh.length}`], ...(end ? [['PAGINATION_COMPLETED'] as EvIn] : [])]);
    } catch (e) {
      if (c.signal.aborted || id !== req.current) return;
      inflight.current = false;
      const msg = e instanceof SyntaxError ? 'Respuesta JSON inválida' : e instanceof TypeError ? 'Fallo de red' : (e as Error).message;
      upd((p) => ({ failed: p.failed + 1, active: 0, phase: 'ERROR', error: msg }), [['FETCH_FAILED', `${pageLabel}: ${msg}`, Math.round(performance.now() - t0)]]);
    }
  }, [fetcher, upd]);

  useEffect(() => () => {
    if (inflight.current) { ctrl.current?.abort(); inflight.current = false; }
    req.current++;
  }, [upd]);

  const onVisible = useCallback(() => {
    if (inflight.current || next.current === null) return;
    upd(() => ({ lastIntersection: Math.round(performance.now()), phase: 'INTERSECTING' }), [['SENTINEL_VISIBLE']]);
    void loadMore();
  }, [upd, loadMore]);
  const onConnection = useCallback((c: 'connected' | 'disconnected') => upd((p) => ({ observer: c, phase: p.phase === 'IDLE' && c === 'connected' ? 'OBSERVING' : p.phase }),
    [[c === 'connected' ? 'OBSERVER_CONNECTED' : 'OBSERVER_DISCONNECTED']]), [upd]);
  const retry = useCallback(() => { upd(() => ({ error: null, phase: 'OBSERVING' })); void loadMore(); }, [upd, loadMore]);
  return { ...s, onVisible, onConnection, retry };
}
