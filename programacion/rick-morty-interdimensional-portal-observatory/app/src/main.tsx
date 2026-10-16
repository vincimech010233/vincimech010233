import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { source } from './api/source';
import './styles.css';
createRoot(document.getElementById('root')!).render(<StrictMode><App fetcher={source.fetcher} firstUrl={source.firstUrl} /></StrictMode>);
