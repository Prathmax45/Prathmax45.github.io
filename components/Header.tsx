'use client';
import Link from 'next/link';
import CursorHud from './CursorHud';
import { useEffect, useState, useRef } from 'react';
export default function Header() {
  const view=useRef<HTMLDetailsElement>(null);
  const [open, setOpen] = useState(false), [boost, setBoost] = useState(false), [progress, setProgress] = useState(0);
  useEffect(() => {
    const close = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); if(view.current?.open){view.current.open=false;view.current.querySelector('summary')?.focus();} } };
    const scroll = () => setProgress(Math.round(window.scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight) * 100));
    const dismiss=(e:PointerEvent)=>{if(view.current?.open&&!view.current.contains(e.target as Node))view.current.open=false;};window.addEventListener('pointerdown',dismiss);window.addEventListener('keydown', close); window.addEventListener('scroll', scroll, { passive:true }); scroll();
    return () => { window.removeEventListener('pointerdown',dismiss);window.removeEventListener('keydown', close); window.removeEventListener('scroll', scroll); };
  }, []);
  useEffect(() => { document.body.classList.toggle('overdrive', boost); return () => document.body.classList.remove('overdrive'); }, [boost]);
  return <header className="site-header"><div className="reading-progress" style={{ transform:`scaleX(${progress/100})` }} /><Link href="/" className="wordmark" aria-label="Prathmesh Kanure home"><span className="status-dot" />PK<span className="wordmark-slash"> / </span> SYSTEMS</Link><span className="header-readout">SCROLL <b>{String(progress).padStart(3,'0')}%</b></span><button className="menu-toggle" aria-expanded={open} aria-controls="primary-nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button><nav id="primary-nav" aria-label="Main navigation" className={open ? 'nav open' : 'nav'}>{[['Gravity', '/#work'], ['Waves', '/#wave-field'], ['Chaos', '/#chaos'], ['Work', '/#source-index']].map(([name, href]) => <Link key={name} href={href} onClick={() => setOpen(false)}>{name}</Link>)}</nav><details ref={view} className="view-options"><summary>View</summary><div><CursorHud /><button className="overdrive-toggle" aria-label="Toggle overdrive palette" aria-pressed={boost} onClick={() => setBoost(!boost)}><span>Overdrive</span> {boost?'ON':'OFF'}</button></div></details><a className="header-contact" href="/#contact">Connect ↗</a></header>;
}
