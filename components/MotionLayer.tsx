'use client';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
gsap.registerPlugin(useGSAP, ScrollTrigger);
export default function MotionLayer() {
  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add('(prefers-reduced-motion: no-preference)', () => {
      const lenis = new Lenis({ duration: 0.85, smoothWheel: true, anchors: true });
      const tick = (time: number) => lenis.raf(time * 1000);
      lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(tick);
      gsap.utils.toArray<HTMLElement>('[data-reveal], .section-heading h2, .section-heading p, .vault-card, .mission-timeline article, .skill-board, .dependency-panel, .terminal, .app-list>a, .identity>*, .core-panel').forEach(el => {
        gsap.from(el, { y: 22, opacity: 0, duration: 0.7, ease: 'power2.out', scrollTrigger: { trigger: el, start: 'top 97%', once: true } });
      });
      const refresh = () => requestAnimationFrame(() => ScrollTrigger.refresh());
      document.addEventListener('toggle',refresh,true);
      const tilt = (event: PointerEvent) => {
        if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
        const card=(event.target as HTMLElement).closest<HTMLElement>('.vault-card'); if(!card)return;
        const r=card.getBoundingClientRect();gsap.to(card,{rotationY:(event.clientX-r.left-r.width/2)/r.width*3,rotationX:-(event.clientY-r.top-r.height/2)/r.height*3,transformPerspective:1100,duration:.35,overwrite:'auto'});
      };
      const untilt = (event: PointerEvent) => { const card=(event.target as HTMLElement).closest<HTMLElement>('.vault-card');if(card&&!card.contains(event.relatedTarget as Node))gsap.to(card,{rotationX:0,rotationY:0,duration:.5,overwrite:'auto'}); };
      document.addEventListener('pointermove',tilt);document.addEventListener('pointerout',untilt);
      return () => { document.removeEventListener('toggle',refresh,true);document.removeEventListener('pointermove',tilt);document.removeEventListener('pointerout',untilt);gsap.ticker.remove(tick); lenis.destroy(); };
    });
    return () => media.revert();
  });
  return null;
}
