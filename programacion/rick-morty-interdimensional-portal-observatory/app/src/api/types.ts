export interface Character { id: number; name: string; status: string; species: string; image?: string }
export interface Page { info: { next: string | null }; results: Character[] }
export type Fetcher = (url: string, signal: AbortSignal) => Promise<Page>;

export class ApiResponseError extends Error {
  constructor(public status: number, public retryAfterMs: number | null = null) {
    super(status === 429
      ? `Límite temporal de la API (HTTP 429)${retryAfterMs !== null ? `; espera ${Math.ceil(retryAfterMs / 1000)} s` : ''}`
      : `Error HTTP ${status}`);
    this.name = 'ApiResponseError';
  }
}
