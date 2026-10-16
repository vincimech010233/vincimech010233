export interface Character { id: number; name: string; status: string; species: string; image?: string }
export interface Page { info: { next: string | null }; results: Character[] }
export type Fetcher = (url: string, signal: AbortSignal) => Promise<Page>;
