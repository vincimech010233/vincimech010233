import { useRef, useState } from 'react';
import type { Fetcher } from './api/types';
import { useInfiniteCharacters } from './hooks/useInfiniteCharacters';
import { useIntersectionSentinel } from './hooks/useIntersectionSentinel';

const LABEL: Record<string, string> = { IDLE: 'En reposo', OBSERVING: 'Observando', INTERSECTING: 'Intersección detectada', FETCHING: 'Cargando', SUCCESS: 'Página incorporada', ERROR: 'Error recuperable', COMPLETE: 'Completado' };

function CharacterAvatar({ name, image }: { name: string; image?: string }) {
  const [failed, setFailed] = useState(false);
  return <div className="avatar" aria-hidden="true">
    {image && !failed ? <img src={image} alt="" loading="lazy" onError={() => setFailed(true)} /> : (name.trim()[0] || '?')}
  </div>;
}

export function App({ fetcher, firstUrl }: { fetcher: Fetcher; firstUrl: string }) {
  const h = useInfiniteCharacters(fetcher, firstUrl);
  const sentinel = useRef<HTMLDivElement>(null);
  const hasObserver = typeof IntersectionObserver !== 'undefined';
  useIntersectionSentinel(sentinel, { enabled: h.next !== null && h.phase !== 'ERROR', rearmKey: h.pages, onVisible: h.onVisible, onConnection: h.onConnection });
  const M = ({ k, v }: { k: string; v: string | number }) => <div className="metric"><dt>{k}</dt><dd>{v}</dd></div>;
  return (
    <div className="layout">
      <main>
        <h1>Rick &amp; Morty: Interdimensional Portal Observatory</h1>
        <p role="status" className="sr-only">{LABEL[h.phase]}{h.error ? `: ${h.error}` : ''}</p>
        {h.pages === 0 && h.phase !== 'ERROR' && <div className="skeleton" data-testid="skeleton">Abriendo portal…</div>}
        <ul className="grid" aria-label="Personajes">
          {h.characters.map((c) => (
            <li key={c.id} className="card"><CharacterAvatar name={c.name} image={c.image} />
              <h2>{c.name}</h2><p>{c.species} · {c.status}</p></li>))}
        </ul>
        {h.next !== null && <div ref={sentinel} data-testid="sentinel" aria-hidden="true" className={`portal portal-${h.phase.toLowerCase()}`} />}
        {h.phase === 'FETCHING' && <p data-testid="loading-more" className="state">Loading more characters...</p>}
        {!hasObserver && h.next !== null && h.phase !== 'FETCHING' && <button className="state" onClick={h.retry}>Cargar más personajes</button>}
        {h.error && <div role="alert" className="state err"><p>{h.error}. Los personajes cargados se conservan.</p><button onClick={h.retry}>Reintentar</button></div>}
        {h.next === null && <p data-testid="end-of-list" className="state">End of list</p>}
      </main>
      <aside>
        <details open><summary>Observatorio</summary>
          <dl>
            <M k="Estado portal" v={`${h.phase} (${LABEL[h.phase]})`} /><M k="Observer" v={h.observer} />
            <M k="Personajes" v={h.characters.length} /><M k="Páginas" v={h.pages} />
            <M k="Solicitudes iniciadas" v={h.started} /><M k="Completadas" v={h.completed} />
            <M k="Fallidas" v={h.failed} /><M k="Activas" v={h.active} />
            <M k="Última duración" v={h.lastMs === null ? '—' : `${h.lastMs} ms`} />
            <M k="Última intersección" v={h.lastIntersection === null ? '—' : `t=${h.lastIntersection} ms`} />
            <M k="Siguiente" v={h.next === null ? 'null (fin)' : 'disponible'} />
          </dl>
          <h2>Timeline (últimos 12)</h2>
          <ol className="timeline" role="log" aria-live="off">
            {h.events.slice(-12).reverse().map((e) => <li key={e.id}>{e.t} ms · {e.type}{e.detail ? ` · ${e.detail}` : ''}{e.ms !== undefined ? ` · ${e.ms} ms` : ''}</li>)}
          </ol>
        </details>
      </aside>
    </div>
  );
}
