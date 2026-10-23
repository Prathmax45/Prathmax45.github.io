'use client';
import { useRef, useState } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { frameAt } from '@/lib/demo.mjs';
gsap.registerPlugin(useGSAP, ScrollTrigger);
type Manifest = { frameCount: number; width: number; height: number; pattern: string; indexDigits: number };
const chapters = [ ['A change of perspective.', 'Same curiosity. A much bigger canvas.'], ['Physics. In motion.', 'From a few lines of code to the paths of entire worlds.'], ['Back to the source.', 'Every orbit starts somewhere. Here is where my work begins.'] ];
export default function ScrollStory() {
  const root = useRef<HTMLElement>(null), canvas = useRef<HTMLCanvasElement>(null);
  const [chapter, setChapter] = useState(0), [ready, setReady] = useState(false), [failed, setFailed] = useState(false);
  useGSAP(() => {
    const element = canvas.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let disposed = false, target = 0, manifest: Manifest, observer: ResizeObserver | undefined, trigger: ScrollTrigger | undefined, working = 0;
    const images = new Map<number, HTMLImageElement>(), pending = new Set<number>();
    const controller = new AbortController();
    const context = element.getContext('2d');
    function paint() {
      if (!manifest || !context || disposed) return;
      const candidates = [...images.keys()];
      if (!candidates.length) return;
      const index = images.has(target) ? target : candidates.reduce((a, b) => Math.abs(a - target) < Math.abs(b - target) ? a : b);
      const img = images.get(index)!;
      const rect = element!.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
      if (element!.width !== width || element!.height !== height) { element!.width = width; element!.height = height; }
      const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
      context.drawImage(img, (width - img.naturalWidth * scale) / 2, (height - img.naturalHeight * scale) / 2, img.naturalWidth * scale, img.naturalHeight * scale);
      element!.dataset.frame = String(index); setReady(true);
    }
    function queueFrames() {
      if (!manifest || disposed) return;
      // Keep only a small decoded window; expand only for measured device needs.
      for (const index of images.keys()) if (Math.abs(index - target) > 13) images.delete(index);
      const order = [target, ...Array.from({ length: 10 }, (_, n) => [target + n + 1, target - n - 1]).flat()];
      for (const index of order) {
        if (working >= 4) break;
        if (index < 0 || index >= manifest.frameCount || images.has(index) || pending.has(index)) continue;
        working++; pending.add(index); const img = new Image();
        img.onload = () => { working--; pending.delete(index); if (disposed) return; images.set(index, img); paint(); queueFrames(); };
        img.onerror = () => { working--; pending.delete(index); if (!disposed && index === target) setFailed(true); };
        img.src = `/sequence/${manifest.pattern.replace('{index}', String(index).padStart(manifest.indexDigits, '0'))}`;
      }
    }
    fetch('/sequence/manifest.json', { signal: controller.signal }).then(r => { if (!r.ok) throw Error('Sequence unavailable'); return r.json(); }).then((data: Manifest) => {
      if (disposed) return;
      if (!Number.isInteger(data.frameCount) || data.frameCount < 2 || data.frameCount > 500 || !/^frame-\{index\}\.webp$/.test(data.pattern)) throw Error('Invalid sequence');
      manifest = data; queueFrames(); observer = new ResizeObserver(paint); observer.observe(element);
      trigger = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', onUpdate: self => { target = frameAt(self.progress, manifest.frameCount); setChapter(Math.min(2, Math.floor(self.progress * 3))); paint(); queueFrames(); } });
    }).catch(error => { if (!disposed && error.name !== 'AbortError') setFailed(true); });
    return () => { disposed = true; controller.abort(); trigger?.kill(); observer?.disconnect(); images.clear(); };
  }, { scope: root });
  return <section ref={root} className="story" id="story" aria-label="Scroll through Earth from orbit"><div className="story-sticky"><div className="story-title"><h2>From a bit<br />to an orbit.</h2><a href="#source-index" className="text-link">Go to the work ↗</a></div><div className="story-media"><img className={ready ? 'story-poster covered' : 'story-poster'} src="/sequence/poster.webp" onError={e => { e.currentTarget.src = '/images/earth.webp'; }} alt="Earth seen from the International Space Station" width="1280" height="720" /><canvas ref={canvas} className={ready ? 'sequence ready' : 'sequence'} aria-label="NASA Earth timelapse controlled by your scroll position" role="img" /><div className="story-caption"><h3>{chapters[chapter][0]}</h3><p>{chapters[chapter][1]}</p></div></div><div className="story-bottom"><span>{failed ? 'Still image view' : 'Move through the scene as you scroll'}</span><a href="https://science.nasa.gov/resource/iss-expedition-42-time-lapse-video-of-earth/" target="_blank" rel="noreferrer">Earth footage: NASA/JSC ↗</a></div></div></section>;
}
