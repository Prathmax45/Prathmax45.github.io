import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Header from '@/components/Header';
import './globals.css';
import './kernel.css';
import './expedition.css';
import './core-labs.css';
const display = localFont({ src: '../public/fonts/syne.ttf', variable: '--font-display', display: 'swap', weight: '400 800' });
const sans = localFont({ src: '../public/fonts/space.ttf', variable: '--font-sans', display: 'swap', weight: '300 700' });
const mono = localFont({ src: '../public/fonts/jetbrains.ttf', variable: '--font-mono', display: 'swap', weight: '100 800' });
export const metadata: Metadata = { metadataBase: new URL('https://prathmax45.github.io'), title: { default: 'Prathmesh Kanure — Systems, physics & software', template: '%s — Prathmesh Kanure' }, description: 'Explore Prathmesh Kanure’s projects in systems programming, computational physics, and software. Follow the work, inspect an idea, and start a conversation.', openGraph: { title: 'Prathmesh Kanure', description: 'Systems, physics, and the questions underneath.', images: ['/images/earth.webp'] } };
export default function Layout({ children }: { children: React.ReactNode }) { return <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}><body id="top"><a href="#main" className="skip-link">Skip to content</a><Header />{children}</body></html>; }
