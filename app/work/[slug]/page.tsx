import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { projects } from '@/content/projects';
import Footer from '@/components/Footer';
import MotionLayer from '@/components/MotionLayer';
export function generateStaticParams() { return projects.map(p => ({ slug: p.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const p = projects.find(p => p.slug === slug); return { title: p?.title || 'Project', description: p?.intro }; }
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const p = projects.find(p => p.slug === slug); if (!p) notFound();
  return <><main id="main" className="case-study"><Link href="/#work" className="text-link">← All work</Link><h1 data-reveal>{p.title}</h1><div className="case-summary"><p data-reveal>{p.intro}</p><a className="button" href={p.source} target="_blank" rel="noreferrer">View source ↗</a></div><figure className="case-image"><img src={p.image} alt={p.alt} width="1600" height="1050" /><figcaption>Contextual photography. <Link href="/credits/">Source and credits</Link>.</figcaption></figure><div className="case-body">{p.sections.map(([title, text]) => <section key={title}><h2 data-reveal>{title}</h2><p data-reveal>{text}</p></section>)}</div><Link href="/#lab" className="button">Explore the interactive lab ↗</Link></main><Footer /><MotionLayer /></>;
}
