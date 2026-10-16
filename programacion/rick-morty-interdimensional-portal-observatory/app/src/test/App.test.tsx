import { StrictMode } from 'react';
import { render, screen, act, waitFor, fireEvent } from '@testing-library/react';
import { vi, beforeEach, describe, it, expect } from 'vitest';
import { App } from '../App';
import { createMockFetcher } from '../api/source';
import type { Fetcher } from '../api/types';
import { MAX_EVENTS } from '../hooks/useInfiniteCharacters';
import { Suspense } from 'react';
// @ts-expect-error The challenge delivery is a standalone JSX fragment without a TypeScript declaration.
import { Characters } from '../../../challenge/Characters.jsx';

let ios: { cb: (e: any[]) => void; disconnected: boolean }[] = [];
beforeEach(() => {
  ios = [];
  (globalThis as any).IntersectionObserver = class { o: any; constructor(cb: any) { this.o = { cb, disconnected: false }; ios.push(this.o); }
    observe() {} unobserve() {} disconnect() { this.o.disconnected = true; } };
});
const hit = () => act(async () => { ios.filter((o) => !o.disconnected).forEach((o) => o.cb([{ isIntersecting: true }])); await new Promise((r) => setTimeout(r, 5)); });
const spy = (f: Fetcher) => vi.fn(f);
const cards = () => screen.queryAllByRole('heading', { level: 2, name: /Variante/ }).length;

describe('local equivalents of official behaviours', () => {
  it('title, page 1, concatenation, end-of-list, no requests after end', async () => {
    const f = spy(createMockFetcher(0));
    render(<App fetcher={f} firstUrl="mock://page/1" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Interdimensional Portal Observatory');
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    for (const n of [6, 12, 18, 24]) { await hit(); await waitFor(() => expect(cards()).toBe(n)); }
    expect(screen.getByTestId('end-of-list')).toHaveTextContent('End of list');
    expect(screen.queryByTestId('sentinel')).toBeNull();
    await hit(); expect(f).toHaveBeenCalledTimes(4);
    expect(ios.every((o) => o.disconnected)).toBe(true);
  });
  it('shows loading-more with exact text only while fetching', async () => {
    render(<App fetcher={createMockFetcher(30)} firstUrl="mock://page/1" />);
    await hit(); expect(screen.getByTestId('loading-more')).toHaveTextContent('Loading more characters...');
    await waitFor(() => expect(screen.queryByTestId('loading-more')).toBeNull());
  });
  it('disconnects the observer on unmount', () => {
    const { unmount } = render(<App fetcher={createMockFetcher(0)} firstUrl="mock://page/1" />);
    expect(ios.some((o) => !o.disconnected)).toBe(true); unmount(); expect(ios.every((o) => o.disconnected)).toBe(true);
  });
});

describe('own additional tests', () => {
  it('repeated intersections during a slow fetch produce one request', async () => {
    const f = spy(createMockFetcher(40));
    render(<App fetcher={f} firstUrl="mock://page/1" />);
    await act(async () => { for (let i = 0; i < 5; i++) ios.forEach((o) => o.cb([{ isIntersecting: true }])); });
    expect(f).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(cards()).toBe(6));
  });
  it('Strict Mode does not duplicate requests', async () => {
    const f = spy(createMockFetcher(0));
    render(<StrictMode><App fetcher={f} firstUrl="mock://page/1" /></StrictMode>);
    await hit(); await waitFor(() => expect(cards()).toBe(6)); expect(f).toHaveBeenCalledTimes(1);
  });
  it('aborts an active request on unmount under Strict Mode', async () => {
    let activeSignal: AbortSignal | undefined;
    const f: Fetcher = (_url, signal) => {
      activeSignal = signal;
      return new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new DOMException('Aborted', 'AbortError'))));
    };
    const { unmount } = render(<StrictMode><App fetcher={f} firstUrl="mock://page/1" /></StrictMode>);
    await hit();
    expect(activeSignal?.aborted).toBe(false);
    unmount();
    expect(activeSignal?.aborted).toBe(true);
  });
  it('error keeps previous characters and retry recovers', async () => {
    const ok = createMockFetcher(0); let fail = false;
    const f: Fetcher = (u, s) => (fail ? Promise.reject(new TypeError('x')) : ok(u, s));
    render(<App fetcher={f} firstUrl="mock://page/1" />);
    await hit(); await waitFor(() => expect(cards()).toBe(6));
    fail = true; await hit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Fallo de red');
    expect(cards()).toBe(6);
    fail = false; await act(async () => { screen.getByRole('button', { name: 'Reintentar' }).click(); await new Promise((r) => setTimeout(r, 5)); });
    await waitFor(() => expect(cards()).toBe(12));
  });
  it('rejects duplicate pages and malformed responses', async () => {
    const f: Fetcher = async () => ({ info: { next: 'mock://page/' + Math.random() }, results: [{ id: 1, name: 'Variante C-1', status: 'Alive', species: 'Human' }] });
    render(<App fetcher={f} firstUrl="mock://page/1" />);
    await hit(); await waitFor(() => expect(cards()).toBe(1));
    await hit(); expect(await screen.findByRole('alert')).toHaveTextContent('Página duplicada');
    expect(cards()).toBe(1);
  });
  it('rejects duplicate ids within one page', async () => {
    const f: Fetcher = async () => ({ info: { next: null }, results: [
      { id: 1, name: 'Variante C-1', status: 'Alive', species: 'Human' },
      { id: 1, name: 'Variante C-1 repetida', status: 'Alive', species: 'Human' },
    ] });
    render(<App fetcher={f} firstUrl="mock://page/1" />);
    await hit();
    expect(await screen.findByRole('alert')).toHaveTextContent('Identificadores duplicados');
    expect(cards()).toBe(0);
  });
  it('shows a character initial when its portrait image fails', async () => {
    const f: Fetcher = async () => ({ info: { next: null }, results: [
      { id: 7, name: 'Ziggy', status: 'Alive', species: 'Human', image: 'https://images.test/7.jpeg' },
    ] });
    const { container } = render(<App fetcher={f} firstUrl="mock://page/1" />);
    await hit();
    await waitFor(() => expect(container.querySelector('.avatar img')).not.toBeNull());
    const image = container.querySelector('.avatar img');
    fireEvent.error(image!);
    expect(container.querySelector('.avatar')).toHaveTextContent('Z');
    expect(container.querySelector('.avatar img')).toBeNull();
  });
  it('keeps the avatar visible when a character name is empty', async () => {
    const f: Fetcher = async () => ({ info: { next: null }, results: [
      { id: 8, name: ' ', status: 'unknown', species: 'unknown' },
    ] });
    const { container } = render(<App fetcher={f} firstUrl="mock://page/1" />);
    await hit();
    await waitFor(() => expect(container.querySelector('.avatar')).toHaveTextContent('?'));
  });
  it('provides a keyboard-accessible manual loader without IntersectionObserver', async () => {
    delete (globalThis as any).IntersectionObserver;
    const f = spy(createMockFetcher(0));
    render(<App fetcher={f} firstUrl="mock://page/1" />);
    const button = screen.getByRole('button', { name: 'Cargar más personajes' });
    await act(async () => { button.click(); await new Promise((r) => setTimeout(r, 5)); });
    expect(cards()).toBe(6);
    expect(f).toHaveBeenCalledTimes(1);
  });
  it('telemetry: causal order, real durations, bounded buffer', async () => {
    render(<App fetcher={createMockFetcher(20)} firstUrl="mock://page/1" />);
    await hit(); await waitFor(() => expect(cards()).toBe(6));
    const items = screen.getAllByRole('listitem').map((l) => l.textContent ?? '').filter((t) => / ms · [A-Z_]+/.test(t)).reverse();
    const idx = (n: string) => items.findIndex((t) => t.includes(n));
    expect(idx('OBSERVER_CONNECTED')).toBeLessThan(idx('SENTINEL_VISIBLE'));
    expect(idx('FETCH_STARTED')).toBeLessThan(idx('FETCH_SUCCEEDED'));
    expect(idx('FETCH_SUCCEEDED')).toBeLessThan(idx('CHARACTERS_APPENDED'));
    const dur = Number(/FETCH_SUCCEEDED · página 1 · (\d+) ms/.exec(items.join('\n'))?.[1]);
    expect(dur).toBeGreaterThanOrEqual(15);
    expect(items.length).toBeLessThanOrEqual(MAX_EVENTS);
  });
  it('does not expose URL query values in telemetry or the observatory', async () => {
    const secret = 'test-token-do-not-render';
    const f: Fetcher = async () => ({ info: { next: null }, results: [] });
    render(<App fetcher={f} firstUrl={`https://example.test/page?token=${secret}`} />);
    await hit();
    await waitFor(() => expect(screen.getByTestId('end-of-list')).toBeInTheDocument());
    expect(document.body.textContent).not.toContain(secret);
  });
  it('exposes textual status in an accessible live region', async () => {
    render(<App fetcher={createMockFetcher(0)} firstUrl="mock://page/1" />);
    expect(screen.getAllByRole('status')[0]).toHaveTextContent('Observando');
  });
});

describe('challenge solution fragment', () => {
  it('uses the sentinel, appends the next page, and renders the exact end marker', async () => {
    const oldFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      info: { next: null },
      results: [{ id: 2, name: 'Second', status: 'Alive', species: 'Human' }],
    }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    try {
      const firstPage = Promise.resolve({
        info: { next: 'https://api.test/page/2' },
        results: [{ id: 1, name: 'First', status: 'Alive', species: 'Human' }],
      });
      await act(async () => {
        render(<Suspense fallback={<div>Loading first page</div>}><Characters charactersPromise={firstPage} /></Suspense>);
        await firstPage;
      });
      expect(screen.getByTestId('sentinel')).toBeInTheDocument();
      await waitFor(() => expect(ios.some((o) => !o.disconnected)).toBe(true));
      await hit();
      expect(await screen.findByTestId('end-of-list')).toHaveTextContent('End of list');
      expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['First', 'Second']);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = oldFetch;
    }
  });
  it('rejects cursor cycles in challenge pages', async () => {
    const oldFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      info: { next: 'https://api.test/page/2' },
      results: [
        { id: 2, name: 'Second', status: 'Alive', species: 'Human' },
        { id: 2, name: 'Second duplicate', status: 'Alive', species: 'Human' },
      ],
    }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    try {
      const firstPage = Promise.resolve({
        info: { next: 'https://api.test/page/2' },
        results: [{ id: 1, name: 'First', status: 'Alive', species: 'Human' }],
      });
      await act(async () => {
        render(<Suspense fallback={<div>Loading first page</div>}><Characters charactersPromise={firstPage} /></Suspense>);
        await firstPage;
      });
      await hit();
      expect(await screen.findByRole('alert')).toHaveTextContent('Repeated pagination cursor');
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
      expect(fetchMock).toHaveBeenCalledTimes(1);
    } finally {
      globalThis.fetch = oldFetch;
    }
  });
  it('rejects duplicate character ids in challenge pages', async () => {
    const oldFetch = globalThis.fetch;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => ({
      info: { next: null },
      results: [
        { id: 2, name: 'Second', status: 'Alive', species: 'Human' },
        { id: 2, name: 'Second duplicate', status: 'Alive', species: 'Human' },
      ],
    }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    try {
      const firstPage = Promise.resolve({
        info: { next: 'https://api.test/page/2' },
        results: [{ id: 1, name: 'First', status: 'Alive', species: 'Human' }],
      });
      await act(async () => {
        render(<Suspense fallback={<div>Loading first page</div>}><Characters charactersPromise={firstPage} /></Suspense>);
        await firstPage;
      });
      await hit();
      expect(await screen.findByRole('alert')).toHaveTextContent('Duplicate character id in page');
      expect(screen.getAllByRole('listitem')).toHaveLength(1);
    } finally {
      globalThis.fetch = oldFetch;
    }
  });
  it('loads and retries by keyboard-operable controls without IntersectionObserver', async () => {
    const oldObserver = globalThis.IntersectionObserver;
    const oldFetch = globalThis.fetch;
    delete (globalThis as any).IntersectionObserver;
    const fetchMock = vi.fn()
      .mockRejectedValueOnce(new TypeError('network unavailable'))
      .mockResolvedValueOnce({ ok: true, json: async () => ({
        info: { next: null },
        results: [{ id: 2, name: 'Second', status: 'Alive', species: 'Human' }],
      }) });
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    try {
      const firstPage = Promise.resolve({
        info: { next: 'https://api.test/page/2' },
        results: [{ id: 1, name: 'First', status: 'Alive', species: 'Human' }],
      });
      await act(async () => {
        render(<Suspense fallback={<div>Loading first page</div>}><Characters charactersPromise={firstPage} /></Suspense>);
        await firstPage;
      });
      fireEvent.click(screen.getByRole('button', { name: 'Load more characters' }));
      expect(await screen.findByRole('alert')).toHaveTextContent('network unavailable');
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(await screen.findByTestId('end-of-list')).toHaveTextContent('End of list');
      expect(screen.getAllByRole('listitem').map((item) => item.textContent)).toEqual(['First', 'Second']);
      expect(fetchMock).toHaveBeenCalledTimes(2);
    } finally {
      globalThis.fetch = oldFetch;
      globalThis.IntersectionObserver = oldObserver;
    }
  });
});
