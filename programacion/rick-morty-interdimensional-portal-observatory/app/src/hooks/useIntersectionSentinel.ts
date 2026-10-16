import { useEffect, useRef, type RefObject } from 'react';
interface Opts { enabled: boolean; rearmKey: unknown; onVisible(): void; onConnection(s: 'connected' | 'disconnected'): void }
/** Ciclo de vida del IntersectionObserver. `rearmKey` re-crea el observer tras cada página:
 *  así un sentinel que sigue visible vuelve a emitir una intersección inicial (sin bucles: la guarda está en el fetch). */
export function useIntersectionSentinel(ref: RefObject<Element | null>, o: Opts) {
  const cb = useRef(o); cb.current = o;
  useEffect(() => {
    const el = ref.current;
    if (!o.enabled || !el) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) cb.current.onVisible(); }, { rootMargin: '200px' });
    io.observe(el); cb.current.onConnection('connected');
    return () => { io.disconnect(); cb.current.onConnection('disconnected'); };
  }, [o.enabled, o.rearmKey, ref]);
}
