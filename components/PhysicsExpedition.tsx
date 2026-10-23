import Link from 'next/link';
import { projects, apps, profile } from '@/content/projects';
import PhysicsStage from './PhysicsStage';
import Terminal from './Terminal';
import CpuDemo from './CpuDemo';
import SatelliteViewer from './SatelliteViewer';
import Activity from './Activity';
import ScrollStory from './ScrollStory';
import FieldNote from './FieldNote';

export default function PhysicsExpedition(){
 return <div className="physics-expedition">
  <section id="work" className="gravity-chapter expedition-chapter" aria-labelledby="gravity-title">
   <div className="chapter-entry" id="story-entry"><span className="chapter-coordinate">ENTERING THE UNPREDICTABLE</span><span>YOUR CURIOSITY IS THE INPUT. THE UNIVERSE RESPONDS.</span></div>
   <div className="chapter-heading"><div><p className="chapter-number">01 / GRAVITATIONAL MISCHIEF</p><h2 id="gravity-title" data-reveal>Break the <em>orbit.</em></h2></div><p>Three bodies. One delicate dance.<br/>It only takes one intruder to change everything.<br/><span className="interaction-invitation">That intruder is yours.</span></p></div>
   <PhysicsStage kind="gravity"/>
   <div className="experiment-proof"><p><span>THE PHYSICS</span>Every mass attracts every other mass. Slingshot a small body into the system and the choreography changes. No preset animation.</p><Link href="/work/orbital-mechanics/"><span>THE PROJECT / C++</span><strong>Orbital Mechanics Engine <b>↗</b></strong><small>Vectors, velocity Verlet & the energy behind an orbit.</small></Link></div>
   <p className="model-note">Softened Newtonian N-body model · dimensionless units · max 12 bodies · no collision merging. A separate browser experiment inspired by my Earth–Sun project.</p>
  </section>

  <section id="wave-field" className="wave-chapter expedition-chapter" aria-labelledby="wave-title">
   <div className="wave-layout"><div className="wave-editorial"><p className="chapter-number">02 / CONSTRUCTIVE CHAOS</p><h2 id="wave-title" data-reveal>Make <br/><em>waves.</em></h2><p>A pulse becomes a ripple.<br/>Two openings become a new pattern.<br/>Your touch becomes part of it.</p><div className="wave-legend"><span><i/> CREST</span><span><i/> TROUGH</span></div><p className="wave-question">What happens when your signal meets mine?</p><Link className="expedition-link" href="/work/dpdl/">From equations to behaviour ↗</Link></div><div className="wave-instrument"><PhysicsStage kind="wave"/><div className="wave-footnote"><span>∂²u/∂t² = c² ∇²u</span><p>A classical wave equation, solved on a live grid. Ripples overlap, reinforce and cancel. The barrier changes how they spread.</p></div></div></div>
   <p className="model-note">Finite-difference wave field · damped edges · cyan and pink encode displacement sign. An educational wave model, separate from DP DL’s symbolic equations and PINN workflow.</p>
  </section>

  <section id="chaos" className="chaos-chapter expedition-chapter" aria-labelledby="chaos-title">
   <div className="chaos-layout"><div className="chaos-instrument"><PhysicsStage kind="chaos"/><div className="chaos-legend"><span><i/> WORLD A</span><span><i/> WORLD B</span><span>SAME RULES. DIFFERENT FUTURES.</span></div></div><div className="chaos-editorial"><p className="chapter-number">03 / THE BUTTERFLY QUESTION</p><h2 id="chaos-title" data-reveal>Almost <br/><em>the same.</em></h2><p className="epsilon-number" aria-label="Default initial angular difference, 0.001 radians">0.001<span>DEFAULT RELEASE DIFFERENCE / RAD</span></p><p>Two double pendulums. The same laws. A tiny difference in their starting angle.</p><p>Pull a mass and release both worlds. Watch their traces part ways. Deterministic doesn’t mean predictable.</p><details className="physics-method"><summary>What am I seeing?</summary><p>Two equal-mass, unit-length double pendulums, integrated with fourth-order Runge–Kutta. No friction. The coloured paths trace each lower mass. This illustrates sensitivity to initial conditions; finite timesteps also introduce numerical error.</p><a href="https://www.myphysicslab.com/pendulum/double-pendulum-en.html" target="_blank" rel="noreferrer">Read the equations ↗</a></details></div></div>
  </section>

  <section id="source-index" className="source-chapter expedition-chapter" aria-labelledby="source-title"><div className="source-intro"><p className="chapter-number">THE EXPERIMENTS HAVE A SOURCE</p><h2 id="source-title" data-reveal>Curiosity.<br/><em>Committed.</em></h2><p>The playground is the invitation.<br/>The repositories are the evidence.</p></div><div className="source-index">{projects.map((p,i)=><article className="source-row" key={p.slug}><span className="source-number">0{i+1}</span><Link href={`/work/${p.slug}/`} className="source-photo" tabIndex={-1} aria-hidden="true"><img src={p.image} alt="" width="120" height="100" loading="lazy"/></Link><div><span className="source-language">{p.language} / {p.field}</span><h3><Link href={`/work/${p.slug}/`}>{p.title} <span>↗</span></Link></h3><p>{p.slug==='virtual-computer'?'An instruction. A register. The machine underneath.':p.slug==='orbital-mechanics'?'Numerical motion, custom vectors and energy drift.':'Lagrangian → symbolic equations → a physics-informed network.'}</p></div><a href={p.source} className="source-github" target="_blank" rel="noreferrer" aria-label={`${p.title} source on GitHub`}>Source ↗</a></article>)}</div></section>

  <section id="mission" className="human-chapter expedition-chapter" aria-labelledby="human-title"><div><p className="chapter-number">THE HUMAN IN THE LOOP</p><h2 id="human-title" data-reveal>Build it.<br/><em>Question it.</em></h2><p className="human-statement">I’m Prathmesh. A software engineer with a habit of looking underneath the interface. Computers, physical systems, strange little experiments — I like finding out how they work.</p><a href={profile.linkedin} target="_blank" rel="noreferrer" className="expedition-link">The professional side ↗</a></div><div className="human-notes"><article><span>WHERE I BUILD</span><h3>Siemens Technology<br/>and Services</h3><p>Software / frontend engineering.</p></article><article><span>WHERE I STARTED</span><h3>Computer Engineering</h3><p>B.E. · Dr. D. Y. Patil Institute of Technology.</p></article><div id="arsenal"><span>WHAT I BUILD WITH</span><p className="tool-sentence">C <i>/</i> C++ <i>/</i> Python <i>/</i> React<br/>TypeScript <i>/</i> SymPy <i>/</i> PyTorch<br/>FastAPI <i>/</i> GSAP <i>/</i> Three.js</p></div></div></section>

  <section className="field-notes expedition-chapter" id="field-notes" aria-labelledby="notes-title"><div className="notes-heading"><p className="chapter-number">TAKE A DETOUR</p><h2 id="notes-title">Field <em>notes.</em></h2><p>More things to pull apart.<br/>Open whatever catches your curiosity.</p></div><div className="notes-list">
   <FieldNote number="01" title="The view from up there" caption="SCROLL THROUGH REAL NASA FOOTAGE"><div className="note-content film-note"><ScrollStory/></div></FieldNote>
   <FieldNote number="02" title="Inside an instruction" caption="STEP THROUGH AN 8-BIT MODEL" id="cpu-notebook"><div className="note-content" id="lab"><CpuDemo/><p className="model-note">Educational LOAD / ADD / SEND model. Separate from the original C implementation.</p></div></FieldNote>
   <FieldNote number="03" title="A small satellite, unfolded" caption="ROTATE A CUBESAT CONCEPT"><div className="note-content satellite-note"><SatelliteViewer/></div></FieldNote>
   <FieldNote number="04" title="The work keeps moving" caption="TOOLS, REPOSITORIES & ACTIVITY"><div className="note-content"><div className="app-list">{apps.map(app=><a key={app.name} href={app.href} target="_blank" rel="noreferrer"><h3>{app.name}</h3><p>{app.description}</p><span>{app.type}</span><span>↗</span></a>)}</div><Activity/></div></FieldNote>
  </div></section>

  <section id="shell" className="shell-chapter expedition-chapter"><div className="shell-intro"><p className="chapter-number">FOR THOSE WHO PREFER A PROMPT</p><h2>Talk to <em>the system.</em></h2><p>No secret handshake.<br/>Start with <code>help</code>.</p></div><Terminal/></section>
 </div>;
}
