// ENTREGABLE A — Fragmento de solución para adaptar a Characters() del starter.
// El starter debe proporcionar charactersPromise, consumida por use() bajo Suspense.
import { use, useEffect, useRef, useState } from 'react';

export function Characters({ charactersPromise }) {
  const data = use(charactersPromise);
  const firstIds = new Set();
  for (const character of data.results) {
    if (!character || !Number.isSafeInteger(character.id) || firstIds.has(character.id)) {
      throw new Error('Invalid or duplicate character id in first page');
    }
    firstIds.add(character.id);
  }
  const [items, setItems] = useState(data.results);
  const [next, setNext] = useState(data.info.next);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nextRef = useRef(data.info.next);
  const busy = useRef(false);
  const visited = useRef(new Set());
  const seen = useRef(firstIds);
  const sentinel = useRef(null);
  const retry = useRef(() => {});

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    let alive = true;
    const controller = new AbortController();

    const loadPage = async () => {
      const url = nextRef.current;
      if (busy.current || url === null) return;
      busy.current = true;
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const d = await response.json();
        if (!d?.info || !(typeof d.info.next === 'string' && d.info.next.trim() || d.info.next === null) || !Array.isArray(d.results) || !d.results.every((c) => Number.isSafeInteger(c?.id) && typeof c.name === 'string')) {
          throw new Error('Invalid page');
        }
        if (visited.current.has(url) || (d.info.next !== null && (d.info.next === url || visited.current.has(d.info.next)))) {
          throw new Error('Repeated pagination cursor');
        }
        const pageIds = new Set();
        for (const character of d.results) {
          if (pageIds.has(character.id)) throw new Error('Duplicate character id in page');
          pageIds.add(character.id);
        }
        const fresh = d.results.filter((character) => !seen.current.has(character.id));
        if (d.results.length > 0 && fresh.length === 0) throw new Error('Duplicate page');
        if (!alive) return;
        visited.current.add(url);
        fresh.forEach((character) => seen.current.add(character.id));
        nextRef.current = d.info.next;
        setItems((previous) => [...previous, ...fresh]);
        setNext(d.info.next);
      } catch (e) {
        if (alive && !controller.signal.aborted) setError(e instanceof Error ? e.message : 'Request failed');
      } finally {
        busy.current = false;
        if (alive) setLoading(false);
      }
    };

    retry.current = loadPage;
    if (typeof IntersectionObserver === 'undefined') {
      return () => {
        alive = false;
        retry.current = () => {};
        controller.abort();
      };
    }
    const io = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting)) void loadPage();
    });
    io.observe(el);
    return () => {
      alive = false;
      retry.current = () => {};
      io.disconnect();
      controller.abort();
    };
  }, [next]);

  const hasObserver = typeof IntersectionObserver !== 'undefined';
  return (
    <>
      <ul>{items.map((c) => <li key={c.id}>{c.name}</li>)}</ul>
      {next !== null && <div data-testid="sentinel" ref={sentinel} />}
      {loading && <p data-testid="loading-more">Loading more characters...</p>}
      {error && <div role="alert"><p>{error}. Previously loaded characters are kept.</p><button onClick={() => void retry.current()}>Retry</button></div>}
      {!hasObserver && next !== null && !loading && <button onClick={() => void retry.current()}>Load more characters</button>}
      {next === null && <p data-testid="end-of-list">End of list</p>}
    </>
  );
}
