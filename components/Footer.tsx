import Link from 'next/link';
import { profile } from '@/content/projects';
export default function Footer() {
  return <footer id="contact" className="contact-section"><div className="contact-intro"><h2 data-reveal>Send a signal.</h2><p data-reveal>A project, a question, or a shared curiosity.<br />I’d like to hear it.</p></div><a className="email-link" href={`mailto:${profile.email}`} data-reveal>prathmeshkanure<span>@gmail.com</span></a><div className="contact-links"><a href={`tel:${profile.phone}`}>{profile.phone}</a><div><a href={profile.github} target="_blank" rel="noreferrer">GitHub ↗</a><a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn ↗</a><a href={profile.instagram} target="_blank" rel="noreferrer">Instagram ↗</a></div></div><div className="footer-bottom"><span>Prathmesh Kanure / Earth station.</span><Link href="/credits/">Image & footage credits</Link><a href="#top">Back to top ↑</a></div></footer>;
}
