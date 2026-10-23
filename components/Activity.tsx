'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import { cleanRepos } from '@/lib/demo.mjs';
type Repo = { name: string; url: string; updated: string; language: string };
const snapshot: Repo[] = [ { name: 'DPDL-Physics-Descriptor-Language-', url: 'https://github.com/Prathmax45/DPDL-Physics-Descriptor-Language-', updated: '2026-07-09T17:15:25Z', language: 'Python' }, { name: 'MALLOC-job', url: 'https://github.com/Prathmax45/MALLOC-job', updated: '2026-06-25T17:28:37Z', language: 'Python' }, { name: 'Orbital-Mechanics-Engine', url: 'https://github.com/Prathmax45/Orbital-Mechanics-Engine', updated: '2025-08-10T10:42:24Z', language: 'C++' } ];
export default function Activity() {
  const [repos, setRepos] = useState(snapshot), [status, setStatus] = useState('Saved public snapshot · 22 Oct 2026'), [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null), request = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    request.current?.abort(); const controller = new AbortController(); request.current = controller; setBusy(true);
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch('https://api.github.com/users/Prathmax45/repos?sort=updated&per_page=30', { signal: controller.signal });
      if (!response.ok) throw new Error('GitHub unavailable');
      const entries = cleanRepos(await response.json()); if (!entries.length) throw Error('No public results');
      setRepos(entries); const timestamp = new Date().toISOString(); setStatus(`From GitHub · refreshed ${new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }).format(new Date(timestamp))} IST`);
      try { localStorage.setItem('pk-github', JSON.stringify({ at: timestamp, repos: entries })); } catch { /* Public feed remains usable when storage is disabled. */ }
    } catch { if (!controller.signal.aborted || request.current === controller) setStatus('GitHub unavailable · showing saved public updates'); }
    finally { clearTimeout(timeout); if (request.current === controller) setBusy(false); }
  }, []);
  useEffect(() => {
    let fresh = false;
    try { const saved = JSON.parse(localStorage.getItem('pk-github') || 'null'); if (saved && Array.isArray(saved.repos) && Number.isFinite(Date.parse(saved.at))) { const validated = cleanRepos(saved.repos.map((r: Repo) => ({ name: r.name, html_url: r.url, updated_at: r.updated, language: r.language }))); if (validated.length) { setRepos(validated); setStatus('Cached public updates from GitHub'); fresh = Date.now() - Date.parse(saved.at) < 15 * 60_000; } } } catch { /* Discard malformed public cache. */ }
    const observer = new IntersectionObserver(entries => { if (entries[0].isIntersecting) { if (!fresh) void refresh(); observer.disconnect(); } }, { rootMargin: '100px' });
    if (root.current) observer.observe(root.current);
    return () => { observer.disconnect(); request.current?.abort(); };
  }, [refresh]);
  return <div ref={root} className="activity"><div className="activity-heading"><h3>On the workbench</h3><button className="text-button" onClick={refresh} disabled={busy}>{busy ? 'Refreshing…' : 'Refresh updates ↻'}</button></div><p className="activity-status" aria-live="polite">{status}</p><ul>{repos.map(repo => <li key={repo.url}><a href={repo.url} target="_blank" rel="noreferrer"><span>{repo.name.replaceAll('-', ' ').replaceAll('_', ' ')}</span><small>{repo.language} · {new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' }).format(new Date(repo.updated))}</small><span aria-hidden="true">↗</span></a></li>)}</ul></div>;
}
