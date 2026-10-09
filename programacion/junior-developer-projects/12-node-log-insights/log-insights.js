import { readFile } from 'node:fs/promises';
export function summarize(text) {
  const counts = { INFO:0, WARN:0, ERROR:0, OTHER:0 }; const messages = new Map(); let malformed=0;
  for (const line of text.split(/\r?\n/)) { if (!line.trim()) continue; let record; try { record=JSON.parse(line); } catch { malformed++; continue; }
    const level=String(record.level||'').toUpperCase(); const key=Object.hasOwn(counts,level)?level:'OTHER'; counts[key]++;
    if(key==='ERROR' && typeof record.message==='string'){const msg=record.message.trim()||'(empty message)';messages.set(msg,(messages.get(msg)||0)+1);}
  }
  return {counts,malformed,topErrors:[...messages].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,5)};
}
async function main(){const path=process.argv[2];if(!path){console.error('Usage: node log-insights.js FILE.jsonl');process.exitCode=2;return;}try{const result=summarize(await readFile(path,'utf8'));console.log(`INFO=${result.counts.INFO} WARN=${result.counts.WARN} ERROR=${result.counts.ERROR} OTHER=${result.counts.OTHER} MALFORMED=${result.malformed}`);for(const [message,count] of result.topErrors)console.log(`${count}x ${message}`);}catch(e){console.error(`Could not read file: ${e.message}`);process.exitCode=2;}}
if(process.argv[1] && import.meta.url===new URL(`file://${process.argv[1]}`).href) await main();
